'use client'

import { useState } from 'react'
import { calculateAssessmentScores } from '@/lib/scoring/calculate'
import questionnaireData from '@/data/questionnaire.json'

interface DemoQuestionnaireProps {
  leadData: {
    name: string
    email: string
    school: string
    role: string
  }
  onComplete: () => void
}

export function DemoQuestionnaire({ leadData, onComplete }: DemoQuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showReport, setShowReport] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  // Flatten all questions
  const allQuestions = questionnaireData.themes.flatMap((theme) =>
    theme.items.map((item) => ({
      ...item,
      dimension: theme.code,
      dimensionName: theme.name,
    }))
  )

  const currentQuestion = allQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100
  const currentAnswer = answers[currentQuestion.id] || 50

  const handleSliderChange = (value: number) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // All questions answered - calculate results
      calculateResults()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateResults = async () => {
    // Convert answers to format expected by scoring function
    const questionAnswers = Object.entries(answers).map(([questionId, sliderValue]) => {
      const question = allQuestions.find((q) => q.id === questionId)!
      return {
        question_id: questionId,
        dimension: question.dimension as 'S' | 'P' | 'A' | 'R' | 'K',
        slider_value: sliderValue,
      }
    })

    // Calculate scores
    const scores = calculateAssessmentScores(questionAnswers)
    
    // Simplified report for demo
    const report = {
      scores,
      statements: {
        self_direction: {
          label: scores.self_direction.band.replace('_', ' '),
          statement: 'Your results show strong potential in this area.'
        }
      }
    }

    setReportData(report)
    setShowReport(true)

    // Save to Supabase
    try {
      const response = await fetch('/api/leads/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadData,
          source: 'demo',
          demo_completed: true,
          demo_answers: questionAnswers,
          demo_scores: scores,
        }),
      })

      if (!response.ok) {
        console.error('Failed to save lead data')
      }
    } catch (error) {
      console.error('Error saving lead:', error)
    }
  }

  const getDimensionColor = (dimension: string) => {
    const colors: Record<string, string> = {
      S: 'spark-pink',
      P: 'spark-purple',
      A: 'spark-cyan',
      R: 'spark-lime',
      K: 'spark-yellow',
    }
    return colors[dimension] || 'gray'
  }

  if (showReport && reportData) {
    return <DemoReport reportData={reportData} leadName={leadData.name} leadData={leadData} onClose={onComplete} />
  }

  return (
    <div className="p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestionIndex + 1} of {allQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-spark-pink to-spark-purple h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="mb-8 animate-slide-up">
        <div className="mb-6 flex justify-center">
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            {currentQuestion.dimensionName}
          </span>
        </div>

        <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-10 leading-tight text-center">
          {currentQuestion.text}
        </h3>

        {/* Slider with Pre-Positioned Emojis (Smooth!) */}
        <div className="mb-12">
          <p className="text-center text-gray-600 mb-6 text-lg font-medium">
            Slide to show how you <strong>feel</strong> about this statement
          </p>
          
          <div className="relative py-12">
            {/* Gradient track - with proper bounds */}
            <div className="h-4 rounded-full bg-gradient-to-r from-red-400 via-gray-300 to-green-400 shadow-inner" />
            
            {/* Pre-positioned emojis every 5 points */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 21 }, (_, i) => {
                const position = i * 5
                const getEmoji = (pos: number) => {
                  if (pos < 20) return '😢'
                  if (pos < 35) return '😟'
                  if (pos < 50) return '😐'
                  if (pos < 65) return '🙂'
                  if (pos < 85) return '😊'
                  return '😄'
                }
                
                // Show emoji when slider is within 6 points
                const isNearby = Math.abs(currentAnswer - position) < 6
                
                return (
                  <div
                    key={position}
                    className="absolute top-1/2 transition-all duration-75"
                    style={{
                      left: `${position}%`,
                      transform: `translate(-50%, -50%) scale(${isNearby ? 1.2 : 0.8})`,
                      opacity: isNearby ? 1 : 0,
                      zIndex: isNearby ? 20 : 10,
                    }}
                  >
                    <div className="text-5xl drop-shadow-2xl">
                      {getEmoji(position)}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Slider input - perfectly aligned */}
            <input
              type="range"
              min="0"
              max="100"
              value={currentAnswer}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-4 bg-transparent appearance-none cursor-pointer z-30"
            />
          </div>

          <div className="flex justify-between items-center mt-4 px-4">
            <div className="text-center">
              <div className="text-4xl mb-2">😢</div>
              <span className="text-sm text-gray-600 font-semibold">Strongly Disagree</span>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">😄</div>
              <span className="text-sm text-gray-600 font-semibold">Strongly Agree</span>
            </div>
          </div>
        </div>
        
        {/* Custom slider styles - Hide default thumb */}
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 0;
            height: 0;
            opacity: 0;
          }
          input[type="range"]::-moz-range-thumb {
            width: 0;
            height: 0;
            opacity: 0;
            border: none;
            background: transparent;
          }
        `}</style>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            className="flex-1 px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-spark-pink to-spark-purple hover:opacity-90 transition-all shadow-lg"
          >
            {currentQuestionIndex === allQuestions.length - 1 ? 'See My Results →' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Simple completion status */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          <strong>{Object.keys(answers).length}</strong> of <strong>{allQuestions.length}</strong> questions answered
        </p>
      </div>
    </div>
  )
}

// Demo Report Component
function DemoReport({ reportData, leadName, leadData, onClose }: any) {
  const dimensions = [
    { key: 'self_direction', label: 'Self-Direction', color: 'spark-pink', icon: 'S' },
    { key: 'purpose', label: 'Purpose', color: 'spark-purple', icon: 'P' },
    { key: 'awareness', label: 'Awareness', color: 'spark-cyan', icon: 'A' },
    { key: 'resilience', label: 'Resilience', color: 'spark-lime', icon: 'R' },
    { key: 'knowledge', label: 'Knowledge', color: 'spark-yellow', icon: 'K' },
  ]

  return (
    <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
      {/* Celebration */}
      <div className="text-center mb-8 animate-scale-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Congratulations, {leadName}!
        </h2>
        <p className="text-xl text-gray-600">
          Here's your personalized SPARK report
        </p>
      </div>

      {/* Overall Score Circle */}
      <div className="flex justify-center mb-12">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90" width="192" height="192">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(reportData.scores.overall.score / 10) * 553} 553`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E91E8C" />
                <stop offset="50%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-900">
              {reportData.scores.overall.score.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="grid md:grid-cols-5 gap-4 mb-12">
        {dimensions.map((dim) => {
          const score = reportData.scores[dim.key]
          return (
            <div
              key={dim.key}
              className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className={`w-16 h-16 bg-${dim.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-lg`}>
                {dim.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {score.score.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mb-2">{dim.label}</div>
              <div className={`text-xs font-bold uppercase text-${dim.color}`}>
                {score.band.replace('_', ' ')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sample Statement */}
      <div className="bg-gradient-to-br from-spark-pink/10 to-spark-purple/10 rounded-2xl p-8 mb-8 border-2 border-spark-pink/20">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Your Strongest Area: {reportData.statements.self_direction.label}
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          {reportData.statements.self_direction.statement.substring(0, 300)}...
        </p>
        <p className="text-sm text-gray-500 italic">
          This is just a preview. The full SPARK platform provides detailed insights for all five dimensions!
        </p>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-spark-pink via-spark-purple to-spark-cyan rounded-2xl p-8 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Want the Full Experience?</h3>
        <p className="text-lg mb-6 opacity-90">
          Imagine this for every student in your school - personalized reports, 40 interactive activities, 
          real-time dashboards, and progress tracking.
        </p>
        <p className="text-xl font-bold">
          We'll be in touch at <span className="underline">{leadData.email}</span> when SPARK launches!
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="mt-8 w-full px-8 py-4 bg-gray-900 text-white text-lg rounded-lg font-bold hover:bg-gray-800 transition-colors"
      >
        Close Demo
      </button>
    </div>
  )
}

