"use client"

import { useState } from "react"

interface WeightFormProps {
  onSubmit: () => void
}

export default function WeightForm({ onSubmit }: WeightFormProps) {
  const [weight, setWeight] = useState("")
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg')
  const [bodyFat, setBodyFat] = useState("")
  const [muscleMass, setMuscleMass] = useState("")
  const [notes, setNotes] = useState("")
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!weight) {
      alert("Please enter weight value")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/health-metrics/weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          weight: parseFloat(weight),
          unit,
          bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
          muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
          notes,
          timestamp: new Date(timestamp).toISOString()
        }),
      })

      if (response.ok) {
        // Reset form
        setWeight("")
        setBodyFat("")
        setMuscleMass("")
        setNotes("")
        setTimestamp(new Date().toISOString().slice(0, 16))
        onSubmit() // Refresh data
        alert("Weight reading saved successfully!")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to save weight:", error)
      alert("Failed to save weight reading")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBMICategory = (weightKg: number, heightM: number = 1.7) => {
    const bmi = weightKg / (heightM * heightM)
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { category: "Normal", color: "text-green-600" }
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" }
    return { category: "Obese", color: "text-red-600" }
  }

  const convertToKg = (value: number, unit: string) => {
    return unit === 'lbs' ? value * 0.453592 : value
  }

  const currentWeight = parseFloat(weight)
  const weightKg = weight ? convertToKg(currentWeight, unit) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight *
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === 'kg' ? "70.0" : "154.0"}
            min="20"
            max={unit === 'kg' ? "1000" : "2200"}
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
            onChange={(e) => setUnit(e.target.value as 'kg' | 'lbs')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="lbs">Pounds (lbs)</option>
          </select>
        </div>

        {/* Body Fat % */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Body Fat % (optional)
          </label>
          <input
            type="number"
            step="0.1"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="15.0"
            min="0"
            max="100"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
          />
        </div>

        {/* Muscle Mass */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Muscle Mass {unit} (optional)
          </label>
          <input
            type="number"
            step="0.1"
            value={muscleMass}
            onChange={(e) => setMuscleMass(e.target.value)}
            placeholder={unit === 'kg' ? "35.0" : "77.0"}
            min="0"
            max={unit === 'kg' ? "200" : "440"}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
          />
        </div>

        {/* Timestamp */}
        <div className="md:col-span-2">
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

      {/* BMI Estimate Display */}
      {weightKg && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Weight in kg: <span className="font-semibold">{weightKg.toFixed(1)} kg</span>
          </p>
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> BMI calculation requires height. This is just for weight tracking.
          </p>
        </div>
      )}

      {/* Body Composition Display */}
      {(bodyFat || muscleMass) && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-1">Body Composition</p>
          {bodyFat && (
            <p className="text-sm text-blue-700">
              Body Fat: <span className="font-semibold">{bodyFat}%</span>
            </p>
          )}
          {muscleMass && (
            <p className="text-sm text-blue-700">
              Muscle Mass: <span className="font-semibold">{muscleMass} {unit}</span>
            </p>
          )}
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
          placeholder="Any additional notes about this measurement..."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !weight}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
      >
        {isSubmitting ? "Saving..." : "Save Weight Reading"}
      </button>
    </form>
  )
}
