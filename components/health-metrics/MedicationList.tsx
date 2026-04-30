"use client"

import { useState } from "react"
import { format } from 'date-fns'

interface Medication {
  _id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  startDate: string
  endDate?: string
  isActive: boolean
  reminderEnabled: boolean
  notes?: string
  prescribedBy?: string
  sideEffects?: string[]
  createdAt: string
}

interface MedicationListProps {
  medications: Medication[]
  onUpdate: () => void
}

export default function MedicationList({ medications, onUpdate }: MedicationListProps) {
  const [expandedMed, setExpandedMed] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const toggleMedication = async (medId: string, isActive: boolean) => {
    setIsUpdating(medId)
    try {
      const response = await fetch("/api/health-metrics/medications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: medId,
          isActive: !isActive
        }),
      })

      if (response.ok) {
        onUpdate()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to update medication:", error)
      alert("Failed to update medication")
    } finally {
      setIsUpdating(null)
    }
  }

  const deleteMedication = async (medId: string, medName: string) => {
    if (!confirm(`Are you sure you want to delete ${medName}?`)) {
      return
    }

    setIsUpdating(medId)
    try {
      const response = await fetch(`/api/health-metrics/medications?id=${medId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (response.ok) {
        onUpdate()
        alert("Medication deleted successfully")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to delete medication:", error)
      alert("Failed to delete medication")
    } finally {
      setIsUpdating(null)
    }
  }

  const logMedication = async (medication: Medication, status: 'taken' | 'missed') => {
    try {
      const now = new Date()
      const response = await fetch("/api/health-metrics/medication-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          medicationId: medication._id,
          medicationName: medication.name,
          dosage: medication.dosage,
          scheduledTime: now.toISOString(),
          actualTime: status === 'taken' ? now.toISOString() : undefined,
          status
        }),
      })

      if (response.ok) {
        alert(`Marked ${medication.name} as ${status}`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Failed to log medication:", error)
      alert("Failed to log medication")
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      'once_daily': 'Once Daily',
      'twice_daily': 'Twice Daily',
      'three_times_daily': 'Three Times Daily',
      'four_times_daily': 'Four Times Daily',
      'as_needed': 'As Needed',
      'weekly': 'Weekly',
      'monthly': 'Monthly'
    }
    return labels[frequency] || frequency
  }

  const getNextDose = (times: string[]) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    for (const time of times) {
      const [hours, minutes] = time.split(':').map(Number)
      const doseTime = hours * 60 + minutes
      
      if (doseTime > currentTime) {
        return time
      }
    }
    
    // If no dose today, return first dose tomorrow
    return times[0]
  }

  if (medications.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">💊</div>
          <p>No medications added yet</p>
          <p className="text-sm">Add your first medication above</p>
        </div>
      </div>
    )
  }

  const activeMedications = medications.filter(med => med.isActive)
  const inactiveMedications = medications.filter(med => !med.isActive)

  return (
    <div className="space-y-4">
      {/* Active Medications */}
      {activeMedications.length > 0 && (
        <div>
          <h5 className="text-md font-semibold text-gray-900 mb-3">Active Medications ({activeMedications.length})</h5>
          <div className="space-y-3">
            {activeMedications.map((medication) => (
              <div key={medication._id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h6 className="text-lg font-semibold text-gray-900">{medication.name}</h6>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Active
                      </span>
                      {medication.reminderEnabled && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          🔔 Reminders On
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Dosage: <span className="font-medium text-gray-900">{medication.dosage}</span></p>
                        <p className="text-gray-600">Frequency: <span className="font-medium text-gray-900">{getFrequencyLabel(medication.frequency)}</span></p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">Times: <span className="font-medium text-gray-900">{medication.times.join(', ')}</span></p>
                        <p className="text-gray-600">Next dose: <span className="font-medium text-indigo-600">{getNextDose(medication.times)}</span></p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">Started: <span className="font-medium text-gray-900">{format(new Date(medication.startDate), 'MMM dd, yyyy')}</span></p>
                        {medication.endDate && (
                          <p className="text-gray-600">Ends: <span className="font-medium text-gray-900">{format(new Date(medication.endDate), 'MMM dd, yyyy')}</span></p>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => logMedication(medication, 'taken')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                      >
                        ✓ Taken
                      </button>
                      <button
                        onClick={() => logMedication(medication, 'missed')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                      >
                        ✗ Missed
                      </button>
                      <button
                        onClick={() => setExpandedMed(expandedMed === medication._id ? null : medication._id)}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition-colors"
                      >
                        {expandedMed === medication._id ? 'Less' : 'More'}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedMed === medication._id && (
                      <div className="mt-4 p-3 bg-white rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {medication.prescribedBy && (
                            <div>
                              <p className="text-gray-600 font-medium">Prescribed By:</p>
                              <p className="text-gray-900">{medication.prescribedBy}</p>
                            </div>
                          )}
                          
                          {medication.sideEffects && medication.sideEffects.length > 0 && (
                            <div>
                              <p className="text-gray-600 font-medium">Side Effects:</p>
                              <p className="text-gray-900">{medication.sideEffects.join(', ')}</p>
                            </div>
                          )}
                          
                          {medication.notes && (
                            <div className="md:col-span-2">
                              <p className="text-gray-600 font-medium">Notes:</p>
                              <p className="text-gray-900">{medication.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => toggleMedication(medication._id, medication.isActive)}
                      disabled={isUpdating === medication._id}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 text-white text-sm rounded-md transition-colors"
                    >
                      {isUpdating === medication._id ? '...' : 'Pause'}
                    </button>
                    <button
                      onClick={() => deleteMedication(medication._id, medication.name)}
                      disabled={isUpdating === medication._id}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm rounded-md transition-colors"
                    >
                      {isUpdating === medication._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Medications */}
      {inactiveMedications.length > 0 && (
        <div>
          <h5 className="text-md font-semibold text-gray-900 mb-3">Paused Medications ({inactiveMedications.length})</h5>
          <div className="space-y-3">
            {inactiveMedications.map((medication) => (
              <div key={medication._id} className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h6 className="text-lg font-semibold text-gray-500">{medication.name}</h6>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Paused
                      </span>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Dosage: {medication.dosage} • {getFrequencyLabel(medication.frequency)}</p>
                      <p>Times: {medication.times.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => toggleMedication(medication._id, medication.isActive)}
                      disabled={isUpdating === medication._id}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm rounded-md transition-colors"
                    >
                      {isUpdating === medication._id ? '...' : 'Resume'}
                    </button>
                    <button
                      onClick={() => deleteMedication(medication._id, medication.name)}
                      disabled={isUpdating === medication._id}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm rounded-md transition-colors"
                    >
                      {isUpdating === medication._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
