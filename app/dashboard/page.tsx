"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FiMessageCircle, 
  FiActivity, 
  FiHeart, 
  FiUser, 
  FiLogOut, 
  FiSend, 
  FiPlus, 
  FiTrendingUp,
  FiDroplet,
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiBarChart
} from "react-icons/fi"
import { GiPill } from "react-icons/gi"
import { TbScale } from "react-icons/tb"
import { getSymptomsByCategory, findSymptomById } from "@/lib/medical-database"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format } from 'date-fns'
import BloodPressureForm from "@/components/health-metrics/BloodPressureForm"
import BloodPressureChart from "@/components/health-metrics/BloodPressureChart"
import BloodSugarForm from "@/components/health-metrics/BloodSugarForm"
import BloodSugarChart from "@/components/health-metrics/BloodSugarChart"
import WeightForm from "@/components/health-metrics/WeightForm"
import WeightChart from "@/components/health-metrics/WeightChart"
import MedicationForm from "@/components/health-metrics/MedicationForm"
import MedicationList from "@/components/health-metrics/MedicationList"

const formatAIResponse = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-black font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-black">$1</em>')
    .replace(/^(🎯|📋|⚠️|💡|🌟|🔍|💊|📊|🎙|🏥|🩺|❗|✅|❌)(.*)$/gm, '<div class="mb-2"><span class="text-lg mr-2">$1</span><span class="text-black font-bold">$2</span></div>')
    .replace(/^• (.*)$/gm, '<div class="ml-4 mb-1 text-black">• $1</div>')
    .replace(/^- (.*)$/gm, '<div class="ml-4 mb-1 text-black">• $1</div>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/Treatment:/gi, '<div class="mt-3 mb-2 text-black font-bold">Treatment:</div>')
    .replace(/Prevention:/gi, '<div class="mt-3 mb-2 text-black font-bold">Prevention:</div>')
    .replace(/Remember:/gi, '<div class="mt-3 mb-2 text-black font-bold">Remember:</div>')
    .replace(/Seek medical attention if:/gi, '<div class="mt-3 mb-2 text-black font-bold">🏥 Seek medical attention if:</div>')
}

const formatSymptomAnalysis = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-black font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-black">$1</em>')
    .replace(/^(🔍|🚨|💡|🏥|🏠|⚠️)(.*)$/gm, '<div class="mb-3 mt-4"><span class="text-xl mr-2">$1</span><span class="text-lg font-bold text-black">$2</span></div>')
    .replace(/^• (.*)$/gm, '<div class="ml-4 mb-1 text-black">• $1</div>')
    .replace(/^- (.*)$/gm, '<div class="ml-4 mb-1 text-black">• $1</div>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/URGENCY LEVEL: (EMERGENCY|HIGH|MEDIUM|LOW)/gi, (match, level) => {
      const colors = {
        EMERGENCY: 'text-red-600 bg-red-100',
        HIGH: 'text-brand-coral bg-brand-peach', 
        MEDIUM: 'text-yellow-600 bg-yellow-100',
        LOW: 'text-brand-aqua bg-brand-mint'
      }
      return `<span class="px-3 py-1 rounded-full text-sm font-bold ${colors[level as keyof typeof colors]}">URGENCY LEVEL: ${level}</span>`
    })
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'chat' | 'symptom-checker' | 'health-metrics'>('chat')
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  
  // Symptom checker states
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [duration, setDuration] = useState("")
  const [severity, setSeverity] = useState("Mild")
  const [analysis, setAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [symptomCategories, setSymptomCategories] = useState<Record<string, any[]>>({})

  // Health metrics states
  const [healthMetricsTab, setHealthMetricsTab] = useState<'overview' | 'blood-pressure' | 'blood-sugar' | 'weight' | 'medications'>('overview')
  const [bloodPressureData, setBloodPressureData] = useState<any[]>([])
  const [bloodSugarData, setBloodSugarData] = useState<any[]>([])
  const [weightData, setWeightData] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
    } else {
      loadChatHistory()
      setSymptomCategories(getSymptomsByCategory())
      if (activeTab === 'health-metrics') {
        loadHealthMetrics()
      }
    }
  }, [session, status, router, activeTab])

  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/messages", {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg._id,
          text: msg.text,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Failed to load chat history:", error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const saveMessage = async (text: string, sender: 'user' | 'ai') => {
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ text, sender }),
      })
    } catch (error) {
      console.error("Failed to save message:", error)
    }
  }

  const loadHealthMetrics = async () => {
    setIsLoadingMetrics(true)
    try {
      // Load blood pressure data
      const bpResponse = await fetch("/api/health-metrics/blood-pressure?days=30", {
        credentials: "include"
      })
      if (bpResponse.ok) {
        const bpData = await bpResponse.json()
        setBloodPressureData(bpData.readings || [])
      }

      // Load blood sugar data
      const bsResponse = await fetch("/api/health-metrics/blood-sugar?days=30", {
        credentials: "include"
      })
      if (bsResponse.ok) {
        const bsData = await bsResponse.json()
        setBloodSugarData(bsData.readings || [])
      }

      // Load weight data
      const weightResponse = await fetch("/api/health-metrics/weight?days=90", {
        credentials: "include"
      })
      if (weightResponse.ok) {
        const weightData = await weightResponse.json()
        setWeightData(weightData.readings || [])
      }

      // Load medications
      const medResponse = await fetch("/api/health-metrics/medications?active=true", {
        credentials: "include"
      })
      if (medResponse.ok) {
        const medData = await medResponse.json()
        setMedications(medData.medications || [])
      }
    } catch (error) {
      console.error("Failed to load health metrics:", error)
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const clearAllChats = async () => {
    try {
      const response = await fetch("/api/messages", {
        method: "DELETE",
        credentials: "include"
      })
      
      if (response.ok) {
        setMessages([])
      }
    } catch (error) {
      console.error("Failed to clear chats:", error)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages?messageId=${messageId}`, {
        method: "DELETE",
        credentials: "include"
      })
      
      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Save user message to database
    await saveMessage(inputMessage, 'user')

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ message: inputMessage }),
      })

      const data = await response.json()

      if (response.ok) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'ai' as const,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        
        // Save AI response to database
        await saveMessage(data.response, 'ai')
      } else {
        throw new Error(data.error || "Failed to get AI response")
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: 'ai' as const,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Save error message to database
      await saveMessage(errorMessage.text, 'ai')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const addSymptom = () => {
    if (!symptomInput.trim()) return
    
    // Find symptom by name or add as custom
    const foundSymptom = Object.values(symptomCategories)
      .flat()
      .find(s => s.name.toLowerCase().includes(symptomInput.toLowerCase()))
    
    if (foundSymptom && !selectedSymptoms.includes(foundSymptom.id)) {
      setSelectedSymptoms(prev => [...prev, foundSymptom.id])
    } else if (!foundSymptom) {
      // Add as custom symptom
      const customId = `custom_${Date.now()}`
      setSelectedSymptoms(prev => [...prev, customId])
    }
    
    setSymptomInput("")
  }

  const removeSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => prev.filter(id => id !== symptomId))
  }

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return

    setIsAnalyzing(true)
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
      setIsAnalyzing(false)
    }
  }

  const clearSymptomForm = () => {
    setSelectedSymptoms([])
    setSymptomInput("")
    setAge("")
    setGender("")
    setDuration("")
    setSeverity("Mild")
    setAnalysis("")
  }

  if (status === "loading" || isLoadingHistory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {status === "loading" ? "Loading..." : "Loading chat history..."}
          </p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-md border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <FiHeart className="text-white text-xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                MediChat
              </h1>
            </motion.div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-700">
                <FiUser className="text-lg" />
                <span className="text-sm font-medium">Welcome, {session?.user?.name}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-md flex items-center space-x-2"
              >
                <FiLogOut className="text-sm" />
                <span>Sign Out</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Interface */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg shadow-lg border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('symptom-checker')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'symptom-checker'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Symptom Checker
            </button>
            <button
              onClick={() => setActiveTab('health-metrics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'health-metrics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Health Metrics
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-lg border border-gray-200 border-t-0">
          {activeTab === 'chat' ? (
            <div className="h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="bg-blue-600 text-white p-4">
                <h2 className="text-lg font-semibold">AI Health Assistant</h2>
                <p className="text-blue-100 text-sm">Ask me about your health concerns, symptoms, or general wellness questions</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.66-.4c-.54-.18-1.132-.27-1.34-.27-.474 0-.896.227-1.216.598l-1.84 2.122a1 1 0 01-.76.35H5a1 1 0 01-1-1v-2.5a8 8 0 1116 0z" />
                    </svg>
                    <p className="text-lg font-medium">Start a conversation</p>
                    <p className="text-sm">Ask me anything about your health and wellness</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {message.sender === 'ai' ? (
                              <div 
                                className="text-sm prose prose-sm max-w-none text-black prose-p:text-black prose-strong:text-black prose-em:text-black prose-li:text-black prose-headings:text-black"
                                dangerouslySetInnerHTML={{
                                  __html: formatAIResponse(message.text)
                                }}
                              />
                            ) : (
                              <p className="text-sm">{message.text}</p>
                            )}
                            <p className={`text-xs mt-2 ${
                              message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteMessage(message.id)}
                            className="ml-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete message"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your health question here..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'symptom-checker' ? (
            /* Symptom Checker Tab */
            <div className="p-6">
              <h2 className="text-2xl font-bold text-black mb-6">Symptom Checker</h2>
              
              <div className="space-y-6">
                {/* Symptom Input */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Enter symptom...</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                      placeholder="Enter symptom..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                    />
                    <button
                      onClick={addSymptom}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      Add Symptom
                    </button>
                  </div>
                </div>

                {/* Selected Symptoms */}
                {selectedSymptoms.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Selected Symptoms</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map((symptomId) => {
                        const symptom = findSymptomById(symptomId)
                        const name = symptom?.name || symptomId.replace('custom_', 'Custom: ')
                        return (
                          <span
                            key={symptomId}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {name}
                            <button
                              onClick={() => removeSymptom(symptomId)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Severity Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="Mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                {/* Duration Input */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Duration (e.g., 2 days, 1 week)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={analyzeSymptoms}
                    disabled={selectedSymptoms.length === 0 || isAnalyzing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Symptoms"}
                  </button>
                  <button
                    onClick={clearSymptomForm}
                    className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Analysis Results */}
                {analysis && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-black mb-4">Medical Analysis</h3>
                    <div 
                      className="prose prose-sm max-w-none text-black prose-p:text-black prose-strong:text-black prose-em:text-black prose-li:text-black prose-headings:text-black"
                      dangerouslySetInnerHTML={{
                        __html: formatSymptomAnalysis(analysis)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'health-metrics' ? (
            <div className="p-6">
              {/* Health Metrics Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-black mb-2">Health Metrics Dashboard</h2>
                <p className="text-gray-700">Track your vital signs, medications, and health goals</p>
              </div>

              {/* Health Metrics Sub-tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                {[
                  { id: 'overview', label: '📊 Overview' },
                  { id: 'blood-pressure', label: '💓 Blood Pressure' },
                  { id: 'blood-sugar', label: '🩸 Blood Sugar' },
                  { id: 'weight', label: '⚖️ Weight' },
                  { id: 'medications', label: '💊 Medications' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setHealthMetricsTab(tab.id as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      healthMetricsTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Health Metrics Content */}
              {isLoadingMetrics ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading health metrics...</span>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {healthMetricsTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Quick Stats Cards */}
                        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                          <div className="flex items-center">
                            <div className="text-red-600 text-2xl mr-3">💓</div>
                            <div>
                              <p className="text-sm text-red-600 font-medium">Latest BP</p>
                              <p className="text-lg font-bold text-red-800">
                                {bloodPressureData[0] ? `${bloodPressureData[0].systolic}/${bloodPressureData[0].diastolic}` : 'No data'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                          <div className="flex items-center">
                            <div className="text-blue-600 text-2xl mr-3">🩸</div>
                            <div>
                              <p className="text-sm text-blue-600 font-medium">Latest Glucose</p>
                              <p className="text-lg font-bold text-blue-800">
                                {bloodSugarData[0] ? `${bloodSugarData[0].glucose} ${bloodSugarData[0].unit}` : 'No data'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                          <div className="flex items-center">
                            <div className="text-green-600 text-2xl mr-3">⚖️</div>
                            <div>
                              <p className="text-sm text-green-600 font-medium">Latest Weight</p>
                              <p className="text-lg font-bold text-green-800">
                                {weightData[0] ? `${weightData[0].weight} ${weightData[0].unit}` : 'No data'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                          <div className="flex items-center">
                            <div className="text-purple-600 text-2xl mr-3">💊</div>
                            <div>
                              <p className="text-sm text-purple-600 font-medium">Active Meds</p>
                              <p className="text-lg font-bold text-purple-800">{medications.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Trends Charts */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Blood Pressure Trend */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-black mb-4">Blood Pressure Trend (30 days)</h3>
                          {bloodPressureData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={bloodPressureData.slice(0, 10).reverse()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="timestamp" 
                                  tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                                />
                                <YAxis />
                                <Tooltip 
                                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" />
                                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-48 text-gray-500">
                              No blood pressure data available
                            </div>
                          )}
                        </div>

                        {/* Weight Trend */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-black mb-4">Weight Trend (90 days)</h3>
                          {weightData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={weightData.slice(0, 15).reverse()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="timestamp" 
                                  tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                                />
                                <YAxis />
                                <Tooltip 
                                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="weight" stroke="#10b981" name="Weight" />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-48 text-gray-500">
                              No weight data available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Blood Pressure Tab */}
                  {healthMetricsTab === 'blood-pressure' && (
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Add Blood Pressure Reading</h3>
                        <BloodPressureForm onSubmit={loadHealthMetrics} />
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Blood Pressure History</h3>
                        <BloodPressureChart data={bloodPressureData} />
                      </div>
                    </div>
                  )}

                  {/* Blood Sugar Tab */}
                  {healthMetricsTab === 'blood-sugar' && (
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Add Blood Sugar Reading</h3>
                        <BloodSugarForm onSubmit={loadHealthMetrics} />
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Blood Sugar History</h3>
                        <BloodSugarChart data={bloodSugarData} />
                      </div>
                    </div>
                  )}

                  {/* Weight Tab */}
                  {healthMetricsTab === 'weight' && (
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Add Weight Reading</h3>
                        <WeightForm onSubmit={loadHealthMetrics} />
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Weight History</h3>
                        <WeightChart data={weightData} />
                      </div>
                    </div>
                  )}

                  {/* Medications Tab */}
                  {healthMetricsTab === 'medications' && (
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Add Medication</h3>
                        <MedicationForm onSubmit={loadHealthMetrics} />
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Active Medications</h3>
                        <MedicationList medications={medications} onUpdate={loadHealthMetrics} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
