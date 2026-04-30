"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getSymptomsByCategory, symptomDatabase } from "@/lib/medical-database"

const formatSymptomAnalysis = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-gray-700">$1</em>')
    .replace(/^(🔍|🚨|💡|🏥|🏠|⚠️)(.*)$/gm, '<div class="mb-3 mt-4"><span class="text-xl mr-2">$1</span><span class="text-lg font-semibold text-indigo-700">$2</span></div>')
    .replace(/^• (.*)$/gm, '<div class="ml-4 mb-1 text-gray-700">• $1</div>')
    .replace(/^- (.*)$/gm, '<div class="ml-4 mb-1 text-gray-700">• $1</div>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/URGENCY LEVEL: (EMERGENCY|HIGH|MEDIUM|LOW)/gi, (match, level) => {
      const colors = {
        EMERGENCY: 'text-red-600 bg-red-100',
        HIGH: 'text-orange-600 bg-orange-100', 
        MEDIUM: 'text-yellow-600 bg-yellow-100',
        LOW: 'text-green-600 bg-green-100'
      }
      return `<span class="px-3 py-1 rounded-full text-sm font-bold ${colors[level as keyof typeof colors]}">URGENCY LEVEL: ${level}</span>`
    })
}

export default function SymptomChecker() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [duration, setDuration] = useState("")
  const [severity, setSeverity] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [symptomCategories, setSymptomCategories] = useState<Record<string, any[]>>({})

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
    } else {
      setSymptomCategories(getSymptomsByCategory())
    }
  }, [session, status, router])

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    )
  }

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          age: age ? parseInt(age) : undefined,
          gender,
          duration,
          severity
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAnalysis(data.analysis)
      } else {
        setAnalysis("Sorry, I'm having trouble analyzing your symptoms right now. Please try again.")
      }
    } catch (error) {
      setAnalysis("Sorry, I'm having trouble analyzing your symptoms right now. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const clearForm = () => {
    setSelectedSymptoms([])
    setAge("")
    setGender("")
    setDuration("")
    setSeverity("")
    setAnalysis("")
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Symptom Checker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Back to Chat
              </button>
              <span className="text-sm text-gray-600">Welcome, {session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tell us about your symptoms</h2>
            
            {/* Patient Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Symptom Duration and Severity */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select duration</option>
                    <option value="less_than_1_day">Less than 1 day</option>
                    <option value="1_3_days">1-3 days</option>
                    <option value="4_7_days">4-7 days</option>
                    <option value="1_2_weeks">1-2 weeks</option>
                    <option value="more_than_2_weeks">More than 2 weeks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select severity</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Symptom Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Select your symptoms</h3>
              {Object.entries(symptomCategories).map(([category, symptoms]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-md font-medium text-indigo-600 mb-2">{category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {symptoms.map((symptom) => (
                      <label key={symptom.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSymptoms.includes(symptom.id)}
                          onChange={() => handleSymptomToggle(symptom.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{symptom.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={analyzeSymptoms}
                disabled={selectedSymptoms.length === 0 || isLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {isLoading ? "Analyzing..." : "Analyze Symptoms"}
              </button>
              <button
                onClick={clearForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Analysis</h2>
            
            {analysis ? (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formatSymptomAnalysis(analysis)
                }}
              />
            ) : (
              <div className="text-center text-gray-500 py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">Select symptoms and click "Analyze Symptoms"</p>
                <p className="text-sm">Get AI-powered medical analysis with clinical decision support</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
