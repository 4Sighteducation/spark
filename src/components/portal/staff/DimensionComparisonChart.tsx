'use client'

interface DimensionComparisonChartProps {
  dimensions: {
    self_direction: number
    purpose: number
    awareness: number
    resilience: number
    knowledge: number
  }
}

export default function DimensionComparisonChart({ dimensions }: DimensionComparisonChartProps) {
  const dimensionData = [
    { 
      key: 'self_direction', 
      label: 'Self-Direction', 
      value: dimensions.self_direction,
      color: 'bg-pink-500',
      lightColor: 'bg-pink-100'
    },
    { 
      key: 'purpose', 
      label: 'Purpose', 
      value: dimensions.purpose,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100'
    },
    { 
      key: 'awareness', 
      label: 'Awareness', 
      value: dimensions.awareness,
      color: 'bg-cyan-500',
      lightColor: 'bg-cyan-100'
    },
    { 
      key: 'resilience', 
      label: 'Resilience', 
      value: dimensions.resilience,
      color: 'bg-lime-500',
      lightColor: 'bg-lime-100'
    },
    { 
      key: 'knowledge', 
      label: 'Knowledge', 
      value: dimensions.knowledge,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-100'
    },
  ]

  const maxScore = 10
  const avgOfAll = dimensionData.reduce((sum, d) => sum + d.value, 0) / dimensionData.length

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-6">
        {dimensionData.map((dim, idx) => {
          const percentage = (dim.value / maxScore) * 100
          const isAboveAverage = dim.value >= avgOfAll

          return (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-gray-900">{dim.label}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {dim.value.toFixed(1)}
                  <span className="text-sm text-gray-500 ml-1">/ 10</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className={`w-full ${dim.lightColor} rounded-full h-8 relative overflow-hidden`}>
                <div
                  className={`${dim.color} h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 20 && (
                    <span className="text-white text-xs font-semibold">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Average line indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-900 opacity-30"
                  style={{ left: `${(avgOfAll / maxScore) * 100}%` }}
                  title={`Cohort average: ${avgOfAll.toFixed(1)}`}
                />
              </div>

              {/* Comparison to average */}
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                <span>
                  {isAboveAverage ? '↑' : '↓'} 
                  {Math.abs(dim.value - avgOfAll).toFixed(1)} 
                  {isAboveAverage ? ' above' : ' below'} cohort avg
                </span>
                <span className="text-gray-400">
                  Cohort avg: {avgOfAll.toFixed(1)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {avgOfAll.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">Overall Average</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {Math.max(...dimensionData.map(d => d.value)).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">Highest</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600">
            {Math.min(...dimensionData.map(d => d.value)).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">Lowest</div>
        </div>
      </div>
    </div>
  )
}

