'use client'

interface Student {
  overall_score: number
  [key: string]: any
}

interface ScoreDistributionChartProps {
  students: Student[]
}

export default function ScoreDistributionChart({ students }: ScoreDistributionChartProps) {
  // Create buckets: 0-2, 2-4, 4-6, 6-8, 8-10
  const buckets = [
    { label: '0-2', min: 0, max: 2, color: 'bg-red-500', count: 0 },
    { label: '2-4', min: 2, max: 4, color: 'bg-orange-500', count: 0 },
    { label: '4-6', min: 4, max: 6, color: 'bg-yellow-500', count: 0 },
    { label: '6-8', min: 6, max: 8, color: 'bg-green-500', count: 0 },
    { label: '8-10', min: 8, max: 10, color: 'bg-green-600', count: 0 },
  ]

  students.forEach(student => {
    const score = student.overall_score
    for (const bucket of buckets) {
      if (score >= bucket.min && score < bucket.max) {
        bucket.count++
        break
      }
      if (score === 10 && bucket.max === 10) {
        bucket.count++
        break
      }
    }
  })

  const maxCount = Math.max(...buckets.map(b => b.count), 1)

  if (students.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-600">No data available</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-end justify-around h-64 gap-4">
        {buckets.map((bucket, idx) => {
          const height = (bucket.count / maxCount) * 100
          return (
            <div key={idx} className="flex flex-col items-center flex-1">
              {/* Bar */}
              <div className="w-full flex items-end justify-center h-48">
                <div
                  className={`${bucket.color} rounded-t-lg w-full transition-all hover:opacity-80 relative group`}
                  style={{ height: `${height}%`, minHeight: bucket.count > 0 ? '20px' : '0' }}
                >
                  {/* Count label on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {bucket.count} student{bucket.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-gray-700">{bucket.label}</div>
                <div className="text-xs text-gray-500 mt-1">{bucket.count}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Total Students: {students.length}</p>
        <p className="text-xs mt-1">
          Average Score: {(students.reduce((sum, s) => sum + s.overall_score, 0) / students.length).toFixed(1)}
        </p>
      </div>
    </div>
  )
}

