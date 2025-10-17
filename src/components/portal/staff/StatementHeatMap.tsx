'use client'

interface Statement {
  question_number: number
  statement: string
  dimension: string
  avg_score: number
  responses_count: number
}

interface StatementHeatMapProps {
  statements: Statement[]
}

export default function StatementHeatMap({ statements }: StatementHeatMapProps) {
  function getScoreColor(score: number): string {
    if (score >= 7) return 'bg-green-500'
    if (score >= 5) return 'bg-yellow-400'
    if (score >= 3) return 'bg-orange-400'
    return 'bg-red-500'
  }

  function getScoreBgColor(score: number): string {
    if (score >= 7) return 'bg-green-50 border-green-200'
    if (score >= 5) return 'bg-yellow-50 border-yellow-200'
    if (score >= 3) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  const dimensionNames: Record<string, string> = {
    'S': 'Self-Direction',
    'P': 'Purpose',
    'A': 'Awareness',
    'R': 'Resilience',
    'K': 'Knowledge'
  }

  const dimensionColors: Record<string, string> = {
    'S': 'bg-pink-100 text-pink-700',
    'P': 'bg-purple-100 text-purple-700',
    'A': 'bg-cyan-100 text-cyan-700',
    'R': 'bg-lime-100 text-lime-700',
    'K': 'bg-yellow-100 text-yellow-700'
  }

  if (statements.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-600">No statement data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {statements.map((stmt) => (
        <div
          key={stmt.question_number}
          className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getScoreBgColor(stmt.avg_score)}`}
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left: Question info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-500">
                  Q{stmt.question_number}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${dimensionColors[stmt.dimension] || 'bg-gray-100 text-gray-700'}`}>
                  {dimensionNames[stmt.dimension] || stmt.dimension}
                </span>
                <span className="text-xs text-gray-500">
                  {stmt.responses_count} responses
                </span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">
                {stmt.statement}
              </p>
            </div>

            {/* Right: Score indicator */}
            <div className="flex flex-col items-center min-w-[80px]">
              <div className={`text-2xl font-bold ${
                stmt.avg_score >= 7 ? 'text-green-700' :
                stmt.avg_score >= 5 ? 'text-yellow-700' :
                stmt.avg_score >= 3 ? 'text-orange-700' :
                'text-red-700'
              }`}>
                {stmt.avg_score.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600 mt-1">avg score</div>
              
              {/* Visual bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${getScoreColor(stmt.avg_score)}`}
                  style={{ width: `${(stmt.avg_score / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

