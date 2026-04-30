"use client"

import { useState } from "react"

interface BloodPressureFormProps {
  onSubmit: () => void
}

export default function BloodPressureForm({ onSubmit }: BloodPressureFormProps) {
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [notes, setNotes] = useState("")
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!systolic || !diastolic) {
      alert("Please enter both systolic and diastolic values")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/health-metrics/blood-pressure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          systolic: parseInt(systolic),
          diastolic: parseInt(diastolic),
          heartRate: heartRate ? parseInt(heartRate) : undefined,
          notes,
          timestamp: new Date(timestamp).toISOString()
        }),
      })

      if (response.ok) {
        // Reset form
        setSystolic("")
        setDiastolic("")
        setHeartRate("")
        setNotes("")
        setTimestamp(new Date().toISOString().slice(0, 16))
        onSubmit() // Refresh data
        alert("Blood pressure reading saved successfully!")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to save blood pressure:", error)
      alert("Failed to save blood pressure reading")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBPCategory = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { category: "Normal", color: "text-green-600" }
    if (sys < 130 && dia < 80) return { category: "Elevated", color: "text-yellow-600" }
    if (sys < 140 || dia < 90) return { category: "Stage 1 High", color: "text-orange-600" }
    if (sys < 180 || dia < 120) return { category: "Stage 2 High", color: "text-red-600" }
    return { category: "Hypertensive Crisis", color: "text-red-800" }
  }

  const currentSys = parseInt(systolic)
  const currentDia = parseInt(diastolic)
  const bpCategory = (systolic && diastolic) ? getBPCategory(currentSys, currentDia) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Systolic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Systolic (mmHg) *
          </label>
          <input
            type="number"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            placeholder="120"
            min="50"
            max="300"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
            required
          />
        </div>

        {/* Diastolic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diastolic (mmHg) *
          </label>
          <input
            type="number"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            placeholder="80"
            min="30"
            max="200"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
            required
          />
        </div>

        {/* Heart Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Heart Rate (bpm)
          </label>
          <input
            type="number"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            placeholder="72"
            min="30"
            max="220"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
          />
        </div>

        {/* Timestamp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
          />
        </div>
      </div>

      {/* BP Category Display */}
      {bpCategory && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Blood Pressure Category: <span className={`font-semibold ${bpCategory.color}`}>
              {bpCategory.category}
            </span>
          </p>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes about this reading..."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !systolic || !diastolic}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
      >
        {isSubmitting ? "Saving..." : "Save Blood Pressure Reading"}
      </button>
    </form>
  )
}
