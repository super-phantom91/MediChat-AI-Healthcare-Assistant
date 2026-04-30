"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format } from 'date-fns'

interface BloodSugarReading {
  _id: string
  glucose: number
  unit: 'mg/dL' | 'mmol/L'
  measurementType: 'fasting' | 'postprandial' | 'random' | 'bedtime'
  timestamp: string
  notes?: string
}

interface BloodSugarChartProps {
  data: BloodSugarReading[]
}

export default function BloodSugarChart({ data }: BloodSugarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">🩸</div>
          <p>No blood sugar data available</p>
          <p className="text-sm">Add your first reading to see trends</p>
        </div>
      </div>
    )
  }

  // Convert all readings to mg/dL for consistency
  const normalizedData = data.map(reading => ({
    ...reading,
    glucoseMgDl: reading.unit === 'mmol/L' ? reading.glucose * 18 : reading.glucose,
    date: format(new Date(reading.timestamp), 'MM/dd'),
    fullDate: format(new Date(reading.timestamp), 'MMM dd, yyyy HH:mm')
  })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const getGlucoseCategory = (value: number, type: string) => {
    if (type === 'fasting') {
      if (value < 100) return { category: "Normal", color: "text-green-600", bg: "bg-green-50" }
      if (value < 126) return { category: "Prediabetes", color: "text-yellow-600", bg: "bg-yellow-50" }
      return { category: "Diabetes", color: "text-red-600", bg: "bg-red-50" }
    } else if (type === 'postprandial') {
      if (value < 140) return { category: "Normal", color: "text-green-600", bg: "bg-green-50" }
      if (value < 200) return { category: "Prediabetes", color: "text-yellow-600", bg: "bg-yellow-50" }
      return { category: "Diabetes", color: "text-red-600", bg: "bg-red-50" }
    } else {
      if (value < 140) return { category: "Normal", color: "text-green-600", bg: "bg-green-50" }
      if (value < 200) return { category: "Elevated", color: "text-yellow-600", bg: "bg-yellow-50" }
      return { category: "High", color: "text-red-600", bg: "bg-red-50" }
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const originalValue = data.unit === 'mmol/L' ? (data.glucoseMgDl / 18).toFixed(1) : data.glucoseMgDl
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullDate}</p>
          <p className="text-blue-600">
            Glucose: <span className="font-semibold">{originalValue} {data.unit}</span>
          </p>
          <p className="text-purple-600 capitalize">
            Type: <span className="font-semibold">{data.measurementType.replace('_', ' ')}</span>
          </p>
          {data.notes && (
            <p className="text-gray-600 text-sm mt-1">
              Note: {data.notes}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Calculate averages by type
  const fastingReadings = normalizedData.filter(r => r.measurementType === 'fasting')
  const postprandialReadings = normalizedData.filter(r => r.measurementType === 'postprandial')
  
  const avgFasting = fastingReadings.length > 0 
    ? Math.round(fastingReadings.reduce((sum, r) => sum + r.glucoseMgDl, 0) / fastingReadings.length)
    : null
  
  const avgPostprandial = postprandialReadings.length > 0
    ? Math.round(postprandialReadings.reduce((sum, r) => sum + r.glucoseMgDl, 0) / postprandialReadings.length)
    : null

  // Group data by measurement type for bar chart
  const typeDistribution = data.reduce((acc, reading) => {
    acc[reading.measurementType] = (acc[reading.measurementType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(typeDistribution).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
    count
  }))

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Latest Reading</p>
            <p className="text-lg font-bold text-blue-800">
              {data[0]?.glucose} {data[0]?.unit}
            </p>
            <p className="text-xs text-blue-600 capitalize">
              {data[0]?.measurementType.replace('_', ' ')}
            </p>
          </div>
        </div>

        {avgFasting && (
          <div className={`p-4 rounded-lg ${getGlucoseCategory(avgFasting, 'fasting').bg}`}>
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg Fasting</p>
              <p className={`text-lg font-bold ${getGlucoseCategory(avgFasting, 'fasting').color}`}>
                {avgFasting} mg/dL
              </p>
              <p className={`text-xs ${getGlucoseCategory(avgFasting, 'fasting').color}`}>
                {getGlucoseCategory(avgFasting, 'fasting').category}
              </p>
            </div>
          </div>
        )}

        {avgPostprandial && (
          <div className={`p-4 rounded-lg ${getGlucoseCategory(avgPostprandial, 'postprandial').bg}`}>
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg After Meal</p>
              <p className={`text-lg font-bold ${getGlucoseCategory(avgPostprandial, 'postprandial').color}`}>
                {avgPostprandial} mg/dL
              </p>
              <p className={`text-xs ${getGlucoseCategory(avgPostprandial, 'postprandial').color}`}>
                {getGlucoseCategory(avgPostprandial, 'postprandial').category}
              </p>
            </div>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Readings</p>
            <p className="text-lg font-bold text-gray-800">{data.length}</p>
            <p className="text-xs text-gray-600">
              Last 30 days
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Blood Sugar Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={normalizedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 20', 'dataMax + 20']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Reference lines */}
              <Line 
                type="monotone" 
                dataKey={() => 100} 
                stroke="#10b981" 
                strokeDasharray="5 5" 
                dot={false}
                name="Normal Fasting (100)"
                strokeWidth={1}
              />
              <Line 
                type="monotone" 
                dataKey={() => 140} 
                stroke="#f59e0b" 
                strokeDasharray="5 5" 
                dot={false}
                name="Normal Post-meal (140)"
                strokeWidth={1}
              />
              
              {/* Actual readings */}
              <Line 
                type="monotone" 
                dataKey="glucoseMgDl" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Glucose (mg/dL)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Measurement Type Distribution */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Reading Types</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="type" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Readings Table */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Readings</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Glucose</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(0, 10).map((reading) => {
                const mgdl = reading.unit === 'mmol/L' ? reading.glucose * 18 : reading.glucose
                const category = getGlucoseCategory(mgdl, reading.measurementType)
                return (
                  <tr key={reading._id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {format(new Date(reading.timestamp), 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-blue-600">
                      {reading.glucose} {reading.unit}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                      {reading.measurementType.replace('_', ' ')}
                    </td>
                    <td className={`px-4 py-2 text-sm font-medium ${category.color}`}>
                      {category.category}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {reading.notes || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
