"use client"

import { useState } from "react"

interface MedicationFormProps {
  onSubmit: () => void
}

export default function MedicationForm({ onSubmit }: MedicationFormProps) {
  const [name, setName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState<'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'as_needed' | 'weekly' | 'monthly'>('once_daily')
  const [times, setTimes] = useState<string[]>(['08:00'])
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState("")
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [notes, setNotes] = useState("")
  const [prescribedBy, setPrescribedBy] = useState("")
  const [sideEffects, setSideEffects] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const frequencyOptions = [
    { value: 'once_daily', label: 'Once Daily', times: 1 },
    { value: 'twice_daily', label: 'Twice Daily', times: 2 },
    { value: 'three_times_daily', label: 'Three Times Daily', times: 3 },
    { value: 'four_times_daily', label: 'Four Times Daily', times: 4 },
    { value: 'as_needed', label: 'As Needed', times: 1 },
    { value: 'weekly', label: 'Weekly', times: 1 },
    { value: 'monthly', label: 'Monthly', times: 1 }
  ]

  const handleFrequencyChange = (newFrequency: string) => {
    setFrequency(newFrequency as any)
    const option = frequencyOptions.find(opt => opt.value === newFrequency)
    if (option) {
      const defaultTimes = Array(option.times).fill(0).map((_, i) => {
        const hour = 8 + (i * 8) // 8am, 4pm, 12am, 8am next day
        return `${hour.toString().padStart(2, '0')}:00`
      })
      setTimes(defaultTimes)
    }
  }

  const handleTimeChange = (index: number, time: string) => {
    const newTimes = [...times]
    newTimes[index] = time
    setTimes(newTimes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !dosage || !startDate) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/health-metrics/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          dosage,
          frequency,
          times,
          startDate,
          endDate: endDate || undefined,
          reminderEnabled,
          notes,
          prescribedBy,
          sideEffects: sideEffects.split(',').map(s => s.trim()).filter(s => s)
        }),
      })

      if (response.ok) {
        // Reset form
        setName("")
        setDosage("")
        setFrequency('once_daily')
        setTimes(['08:00'])
        setStartDate(new Date().toISOString().slice(0, 10))
        setEndDate("")
        setReminderEnabled(true)
        setNotes("")
        setPrescribedBy("")
        setSideEffects("")
        onSubmit() // Refresh data
        alert("Medication added successfully!")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to save medication:", error)
      alert("Failed to save medication")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medication Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medication Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Lisinopril, Metformin"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
            required
          />
        </div>

        {/* Dosage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dosage *
          </label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g., 10mg, 500mg, 1 tablet"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
            required
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency *
          </label>
          <select
            value={frequency}
            onChange={(e) => handleFrequencyChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            required
          >
            {frequencyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prescribed By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prescribed By
          </label>
          <input
            type="text"
            value={prescribedBy}
            onChange={(e) => setPrescribedBy(e.target.value)}
            placeholder="Dr. Smith"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date (optional)
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
          />
        </div>
      </div>

      {/* Times */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Times to Take *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {times.map((time, index) => (
            <input
              key={index}
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(index, e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              required
            />
          ))}
        </div>
      </div>

      {/* Side Effects */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Known Side Effects (comma-separated)
        </label>
        <input
          type="text"
          value={sideEffects}
          onChange={(e) => setSideEffects(e.target.value)}
          placeholder="nausea, dizziness, headache"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Take with food, avoid alcohol, etc."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
        />
      </div>

      {/* Reminder Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="reminderEnabled"
          checked={reminderEnabled}
          onChange={(e) => setReminderEnabled(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="reminderEnabled" className="ml-2 block text-sm text-gray-700">
          Enable medication reminders
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !name || !dosage || !startDate}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
      >
        {isSubmitting ? "Adding..." : "Add Medication"}
      </button>
    </form>
  )
}
