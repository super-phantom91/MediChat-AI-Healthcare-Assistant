"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { format } from 'date-fns'

interface WeightReading {
  _id: string
  weight: number
  unit: 'kg' | 'lbs'
  bodyFat?: number
  muscleMass?: number
  timestamp: string
  notes?: string
}

interface WeightChartProps {
  data: WeightReading[]
}

export default function WeightChart({ data }: WeightChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">⚖️</div>
          <p>No weight data available</p>
          <p className="text-sm">Add your first reading to see trends</p>
        </div>
      </div>
    )
  }

  // Convert all weights to kg for consistency and sort by date
  const normalizedData = data.map(reading => ({
    ...reading,
    weightKg: reading.unit === 'lbs' ? reading.weight * 0.453592 : reading.weight,
    date: format(new Date(reading.timestamp), 'MM/dd'),
    fullDate: format(new Date(reading.timestamp), 'MMM dd, yyyy HH:mm')
  })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullDate}</p>
          <p className="text-green-600">
            Weight: <span className="font-semibold">{data.weight} {data.unit}</span>
          </p>
          {data.bodyFat && (
            <p className="text-blue-600">
              Body Fat: <span className="font-semibold">{data.bodyFat}%</span>
            </p>
          )}
          {data.muscleMass && (
            <p className="text-purple-600">
              Muscle Mass: <span className="font-semibold">{data.muscleMass} {data.unit}</span>
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

  // Calculate statistics
  const weights = normalizedData.map(d => d.weightKg)
  const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const weightChange = weights.length > 1 ? weights[weights.length - 1] - weights[0] : 0

  // Calculate body composition averages
  const bodyFatReadings = normalizedData.filter(d => d.bodyFat).map(d => d.bodyFat!)
  const avgBodyFat = bodyFatReadings.length > 0 
    ? bodyFatReadings.reduce((sum, bf) => sum + bf, 0) / bodyFatReadings.length 
    : null

  const muscleMassReadings = normalizedData.filter(d => d.muscleMass).map(d => d.muscleMass!)
  const avgMuscleMass = muscleMassReadings.length > 0
    ? muscleMassReadings.reduce((sum, mm) => sum + mm, 0) / muscleMassReadings.length
    : null

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Current Weight</p>
            <p className="text-lg font-bold text-green-800">
              {data[0]?.weight} {data[0]?.unit}
            </p>
            <p className="text-xs text-green-600">
              {data[0] ? format(new Date(data[0].timestamp), 'MMM dd') : 'N/A'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Average Weight</p>
            <p className="text-lg font-bold text-blue-800">
              {avgWeight.toFixed(1)} kg
            </p>
            <p className="text-xs text-blue-600">
              Last {data.length} readings
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${weightChange >= 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
          <div className="text-center">
            <p className="text-sm text-gray-600">Weight Change</p>
            <p className={`text-lg font-bold ${weightChange >= 0 ? 'text-orange-800' : 'text-green-800'}`}>
              {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)} kg
            </p>
            <p className={`text-xs ${weightChange >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
              Since first reading
            </p>
          </div>
        </div>

        {avgBodyFat && (
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg Body Fat</p>
              <p className="text-lg font-bold text-purple-800">
                {avgBodyFat.toFixed(1)}%
              </p>
              <p className="text-xs text-purple-600">
                {bodyFatReadings.length} readings
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Trend */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Weight Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={normalizedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Area
                type="monotone"
                dataKey="weightKg"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Weight (kg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Body Composition */}
        {(bodyFatReadings.length > 0 || muscleMassReadings.length > 0) && (
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Body Composition</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={normalizedData.filter(d => d.bodyFat || d.muscleMass)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {bodyFatReadings.length > 0 && (
                  <Line 
                    type="monotone" 
                    dataKey="bodyFat" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Body Fat %"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    connectNulls={false}
                  />
                )}
                
                {muscleMassReadings.length > 0 && (
                  <Line 
                    type="monotone" 
                    dataKey="muscleMass" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name={`Muscle Mass (${data[0]?.unit})`}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Readings Table */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Readings</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Body Fat</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Muscle Mass</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(0, 10).map((reading) => (
                <tr key={reading._id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {format(new Date(reading.timestamp), 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-green-600">
                    {reading.weight} {reading.unit}
                  </td>
                  <td className="px-4 py-2 text-sm text-blue-600">
                    {reading.bodyFat ? `${reading.bodyFat}%` : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-purple-600">
                    {reading.muscleMass ? `${reading.muscleMass} ${reading.unit}` : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {reading.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weight Goals Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Weight Management Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium text-indigo-700 mb-1">Healthy Weight Loss:</p>
            <p>• Aim for 0.5-1 kg (1-2 lbs) per week</p>
            <p>• Focus on sustainable lifestyle changes</p>
            <p>• Combine diet and exercise</p>
          </div>
          <div>
            <p className="font-medium text-indigo-700 mb-1">Tracking Tips:</p>
            <p>• Weigh yourself at the same time daily</p>
            <p>• Track body composition, not just weight</p>
            <p>• Consider weekly averages for trends</p>
          </div>
        </div>
      </div>
    </div>
  )
}
