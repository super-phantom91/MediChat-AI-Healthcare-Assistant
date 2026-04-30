"use client"

import { useState } from "react"

interface BloodSugarFormProps {
  onSubmit: () => void
}

export default function BloodSugarForm({ onSubmit }: BloodSugarFormProps) {
  const [glucose, setGlucose] = useState("")
  const [unit, setUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL')
  const [measurementType, setMeasurementType] = useState<'fasting' | 'postprandial' | 'random' | 'bedtime'>('random')
  const [notes, setNotes] = useState("")
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!glucose) {
      alert("Please enter glucose value")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/health-metrics/blood-sugar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          glucose: parseFloat(glucose),
          unit,
          measurementType,
          notes,
          timestamp: new Date(timestamp).toISOString()
        }),
      })

      if (response.ok) {
        // Reset form
        setGlucose("")
        setNotes("")
        setTimestamp(new Date().toISOString().slice(0, 16))
        onSubmit() // Refresh data
        alert("Blood sugar reading saved successfully!")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to save blood sugar:", error)
      alert("Failed to save blood sugar reading")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getGlucoseCategory = (value: number, type: string, unit: string) => {
    // Convert to mg/dL if needed
    const mgdl = unit === 'mmol/L' ? value * 18 : value
    
    if (type === 'fasting') {
      if (mgdl < 100) return { category: "Normal", color: "text-green-600" }
      if (mgdl < 126) return { category: "Prediabetes", color: "text-yellow-600" }
      return { category: "Diabetes", color: "text-red-600" }
    } else if (type === 'postprandial') {
      if (mgdl < 140) return { category: "Normal", color: "text-green-600" }
      if (mgdl < 200) return { category: "Prediabetes", color: "text-yellow-600" }
      return { category: "Diabetes", color: "text-red-600" }
    } else {
      if (mgdl < 140) return { category: "Normal", color: "text-green-600" }
      if (mgdl < 200) return { category: "Elevated", color: "text-yellow-600" }
      return { category: "High", color: "text-red-600" }
    }
  }

  const currentGlucose = parseFloat(glucose)
  const glucoseCategory = glucose ? getGlucoseCategory(currentGlucose, measurementType, unit) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Glucose Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Glucose Level *
          </label>
          <input
            type="number"
            step="0.1"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            placeholder={unit === 'mg/dL' ? "100" : "5.6"}
            min="20"
            max={unit === 'mg/dL' ? "800" : "44"}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
            required
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'mg/dL' | 'mmol/L')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
          >
            <option value="mg/dL">mg/dL</option>
            <option value="mmol/L">mmol/L</option>
          </select>
        </div>

        {/* Measurement Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Measurement Type *
          </label>
          <select
            value={measurementType}
            onChange={(e) => setMeasurementType(e.target.value as any)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            required
          >
            <option value="fasting">Fasting (8+ hours)</option>
            <option value="postprandial">After Meal (2 hours)</option>
            <option value="random">Random</option>
            <option value="bedtime">Bedtime</option>
          </select>
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

      {/* Glucose Category Display */}
      {glucoseCategory && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Blood Sugar Category: <span className={`font-semibold ${glucoseCategory.color}`}>
              {glucoseCategory.category}
            </span>
          </p>
          <div className="mt-2 text-xs text-gray-500">
            <p><strong>Reference ranges ({measurementType}):</strong></p>
            {measurementType === 'fasting' && (
              <p>Normal: &lt;100 mg/dL | Prediabetes: 100-125 mg/dL | Diabetes: ≥126 mg/dL</p>
            )}
            {measurementType === 'postprandial' && (
              <p>Normal: &lt;140 mg/dL | Prediabetes: 140-199 mg/dL | Diabetes: ≥200 mg/dL</p>
            )}
            {(measurementType === 'random' || measurementType === 'bedtime') && (
              <p>Normal: &lt;140 mg/dL | Elevated: 140-199 mg/dL | High: ≥200 mg/dL</p>
            )}
          </div>
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
        disabled={isSubmitting || !glucose}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
      >
        {isSubmitting ? "Saving..." : "Save Blood Sugar Reading"}
      </button>
    </form>
  )
}
