"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface BloodPressureReading {
  _id: string
  systolic: number
  diastolic: number
  heartRate?: number
  timestamp: string
  notes?: string
}

interface BloodPressureChartProps {
  data: BloodPressureReading[]
}

export default function BloodPressureChart({ data }: BloodPressureChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No blood pressure data available</p>
          <p className="text-sm">Add your first reading to see trends</p>
        </div>
      </div>
    )
  }

  // Sort data by timestamp and reverse for chronological order
  const sortedData = [...data]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(reading => ({
      ...reading,
      date: format(new Date(reading.timestamp), 'MM/dd'),
      fullDate: format(new Date(reading.timestamp), 'MMM dd, yyyy HH:mm')
    }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullDate}</p>
          <p className="text-red-600">
            Systolic: <span className="font-semibold">{data.systolic} mmHg</span>
          </p>
          <p className="text-blue-600">
            Diastolic: <span className="font-semibold">{data.diastolic} mmHg</span>
          </p>
          {data.heartRate && (
            <p className="text-purple-600">
              Heart Rate: <span className="font-semibold">{data.heartRate} bpm</span>
            </p>
          )}
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

  // Calculate averages
  const avgSystolic = Math.round(data.reduce((sum, reading) => sum + reading.systolic, 0) / data.length)
  const avgDiastolic = Math.round(data.reduce((sum, reading) => sum + reading.diastolic, 0) / data.length)

  // Get BP category for average
  const getBPCategory = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { category: "Normal", color: "text-green-600", bg: "bg-green-50" }
    if (sys < 130 && dia < 80) return { category: "Elevated", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (sys < 140 || dia < 90) return { category: "Stage 1 High", color: "text-orange-600", bg: "bg-orange-50" }
    if (sys < 180 || dia < 120) return { category: "Stage 2 High", color: "text-red-600", bg: "bg-red-50" }
    return { category: "Hypertensive Crisis", color: "text-red-800", bg: "bg-red-100" }
  }

  const avgCategory = getBPCategory(avgSystolic, avgDiastolic)

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg ${avgCategory.bg}`}>
          <div className="text-center">
            <p className="text-sm text-gray-600">Average BP</p>
            <p className={`text-lg font-bold ${avgCategory.color}`}>
              {avgSystolic}/{avgDiastolic}
            </p>
            <p className={`text-xs ${avgCategory.color}`}>
              {avgCategory.category}
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Latest Reading</p>
            <p className="text-lg font-bold text-blue-800">
              {data[0]?.systolic}/{data[0]?.diastolic}
            </p>
            <p className="text-xs text-blue-600">
              {data[0] ? format(new Date(data[0].timestamp), 'MMM dd, HH:mm') : 'N/A'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Readings</p>
            <p className="text-lg font-bold text-gray-800">{data.length}</p>
            <p className="text-xs text-gray-600">
              Last {Math.min(data.length, 30)} days
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Blood Pressure Trend</h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={['dataMin - 10', 'dataMax + 10']}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Reference lines for normal BP */}
            <Line 
              type="monotone" 
              dataKey={() => 120} 
              stroke="#10b981" 
              strokeDasharray="5 5" 
              dot={false}
              name="Normal Systolic (120)"
              strokeWidth={1}
            />
            <Line 
              type="monotone" 
              dataKey={() => 80} 
              stroke="#10b981" 
              strokeDasharray="5 5" 
              dot={false}
              name="Normal Diastolic (80)"
              strokeWidth={1}
            />
            
            {/* Actual readings */}
            <Line 
              type="monotone" 
              dataKey="systolic" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Systolic"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="diastolic" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Diastolic"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Readings Table */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Readings</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Systolic</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Diastolic</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Heart Rate</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(0, 10).map((reading) => {
                const category = getBPCategory(reading.systolic, reading.diastolic)
                return (
                  <tr key={reading._id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {format(new Date(reading.timestamp), 'MMM dd, HH:mm')}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-red-600">
                      {reading.systolic}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-blue-600">
                      {reading.diastolic}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {reading.heartRate || 'N/A'}
                    </td>
                    <td className={`px-4 py-2 text-sm font-medium ${category.color}`}>
                      {category.category}
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
