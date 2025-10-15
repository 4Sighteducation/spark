'use client'

import Image from 'next/image'

interface PrintableReportProps {
  name: string
  reportData: any
  school?: string
}

export function PrintableReport({ name, reportData, school }: PrintableReportProps) {
  const dimensions = [
    { 
      key: 'self_direction', 
      label: 'SELF-DIRECTION', 
      subtitle: 'Taking initiative and being pro-active',
      color: '#069BAA',
      lightBg: '#E6F7FA',
      icon: '/icon-self-direction.png'
    },
    { 
      key: 'purpose', 
      label: 'PURPOSE', 
      subtitle: 'Hope, aspirations and your sense of purpose',
      color: '#FF8CB4',
      lightBg: '#FFF0F6',
      icon: '/icon-purpose.png'
    },
    { 
      key: 'awareness', 
      label: 'AWARENESS', 
      subtitle: 'Working with others, empathy and fostering relationships',
      color: '#C83296',
      lightBg: '#FCE6F5',
      icon: '/icon-awareness.png'
    },
    { 
      key: 'resilience', 
      label: 'RESILIENCE', 
      subtitle: 'Grit, Perseverance and Reliability',
      color: '#96B432',
      lightBg: '#F5FAE6',
      icon: '/icon-resilience.png'
    },
    { 
      key: 'knowledge', 
      label: 'KNOWLEDGE', 
      subtitle: 'Curiosity, Attention and How You Value Education',
      color: '#64C896',
      lightBg: '#EEF9F5',
      icon: '/icon-knowledge.png'
    },
  ]

  const today = new Date().toLocaleDateString('en-GB')

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white p-8 font-sans" style={{ pageBreakAfter: 'always' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        {/* SPARK Logo */}
        <div className="bg-black p-4 rounded-lg">
          <Image 
            src="/spark-logo.png" 
            alt="SPARK" 
            width={140} 
            height={70}
            className="object-contain"
          />
        </div>

        {/* Student Info Table */}
        <table className="border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-black px-3 py-2 text-sm font-bold">Name</th>
              <th className="border border-black px-2 py-2 text-sm font-bold">Cycle</th>
              <th className="border border-black px-2 py-2 text-sm font-bold">Group</th>
              <th className="border border-black px-3 py-2 text-sm font-bold">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border-2 border-pink-500 px-3 py-2 text-sm">{name}</td>
              <td className="border-2 border-pink-500 px-2 py-2 text-sm text-center">1</td>
              <td className="border-2 border-pink-500 px-2 py-2 text-sm text-center">8A</td>
              <td className="border-2 border-pink-500 px-3 py-2 text-sm">{today}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Welcome Box */}
      <div className="border-4 border-pink-500 bg-pink-50 rounded-xl p-5 mb-6">
        <h2 className="text-xl font-bold text-center mb-3">Welcome to Your SPARK Report!</h2>
        <p className="text-sm text-gray-800 leading-relaxed">
          This report highlights your strengths and areas to grow across five key themes: Self-Direction, 
          Purpose, Awareness, Resilience, and Knowledge. These qualities help you succeed in school, build 
          strong relationships, and develop a positive, curious mindset. Your SPARK journey is unique—use 
          this report to reflect on your progress, celebrate successes, and set new goals. Remember, learning 
          is a lifelong adventure, and you are in control of your growth!
        </p>
      </div>

      {/* Score Cards - Compact */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-700 mb-2">Your SPARK Scores:</h3>
        <div className="grid grid-cols-5 gap-2">
          {dimensions.map((dim) => {
            const score = reportData.scores[dim.key]
            return (
              <div 
                key={dim.key}
                className="rounded-xl p-2 text-center shadow-lg border-2 border-gray-800"
                style={{ backgroundColor: dim.color }}
              >
                <div className="flex justify-center mb-1">
                  <Image src={dim.icon} alt={dim.label} width={28} height={28} className="object-contain" />
                </div>
                <div className="text-white text-xs font-bold mb-1">{dim.label}</div>
                <div className="text-white text-3xl font-bold">{Math.round(score.score)}</div>
                <div className="text-white text-xs uppercase">{score.band.replace('_', ' ')}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Each Dimension Section */}
      {dimensions.map((dim) => {
        const score = reportData.scores[dim.key]
        const wholeScore = Math.round(score.score)
        const statement = reportData.statements[dim.key]
        
        return (
          <div key={dim.key} className="mb-8 break-inside-avoid">
            {/* 1-10 Score Visualization - Styled with theme colors, full width */}
            <div className="flex gap-1 mb-2 px-4">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <div
                  key={num}
                  className={`flex-1 h-12 rounded-lg border-3 flex items-center justify-center font-bold ${
                    num === wholeScore
                      ? 'text-white text-xl shadow-lg'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                  style={{
                    backgroundColor: num === wholeScore ? dim.color : undefined,
                    borderColor: num === wholeScore ? dim.color : undefined,
                    borderWidth: num === wholeScore ? '3px' : '1px',
                  }}
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Dimension Header Bar */}
            <div 
              className="rounded-lg p-3 mb-2 flex items-center gap-3"
              style={{ backgroundColor: dim.color }}
            >
              <Image src={dim.icon} alt={dim.label} width={32} height={32} className="object-contain" />
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{dim.label}</h3>
                <p className="text-white text-xs italic">{dim.subtitle}</p>
              </div>
            </div>

            {/* ROW 1: Feedback Statement */}
            <div 
              className="border-4 border-pink-500 rounded-xl p-4 mb-1.5"
              style={{ backgroundColor: dim.lightBg }}
            >
              <p className="text-gray-900 text-sm leading-relaxed">
                {statement?.statement || `Great work in ${dim.label}!`}
              </p>
            </div>

            {/* ROW 2: Personal Development Question */}
            {statement?.personal_development_question && (
              <div 
                className="border-4 border-pink-500 rounded-xl p-3 mb-1.5"
                style={{ backgroundColor: dim.lightBg }}
              >
                <p className="text-xs font-bold mb-1.5" style={{ color: dim.color }}>
                  💭 Personal Development Question:
                </p>
                <p className="text-gray-900 text-sm italic leading-relaxed">
                  {statement.personal_development_question}
                </p>
              </div>
            )}

            {/* ROW 3: Suggested Activities */}
            <div 
              className="border-4 border-pink-500 rounded-xl p-3"
              style={{ backgroundColor: dim.lightBg }}
            >
              <p className="text-xs font-bold mb-1.5" style={{ color: dim.color }}>
                🎯 Suggested Activities:
              </p>
              <p className="text-gray-900 text-sm">
                {getSuggestedActivities(dim.key)}
              </p>
            </div>
          </div>
        )
      })}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center">
        <p className="text-sm text-gray-500">
          © 2025 4Sight Education Ltd · www.spark.study · Ages 11-14 · Key Stage 3
        </p>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}

function getSuggestedActivities(dimension: string): string {
  const activities: Record<string, string> = {
    self_direction: 'Two-Minute Takeoff, First Domino, Risk Tokens',
    purpose: 'Purpose Circles, Future-Me Interview, Values to Verbs',
    awareness: 'Listening Ladders, Empathy Walk, Team Reliability Pact',
    resilience: 'Recovery Reframes, Pomodoro Ladder, Plan B Playbook',
    knowledge: 'Curiosity Tickets, Feynman Flip, Extension Quest',
  }
  return activities[dimension] || ''
}

