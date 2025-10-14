'use client'

import { useState } from 'react'
import { calculateAssessmentScores } from '@/lib/scoring/calculate'
import questionnaireData from '@/data/questionnaire.json'
import { DemoReport } from './DemoReport'

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
  const [showExample, setShowExample] = useState(false)

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
    setShowExample(false) // Hide example when moving to next question
    
    // Save current answer if not already saved (even if they didn't move slider)
    if (!answers[currentQuestion.id]) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: currentAnswer,
      })
    }
    
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // All questions answered - calculate results
      // Use setTimeout to ensure state is updated
      setTimeout(() => {
        calculateResults()
      }, 100)
    }
  }

  const handlePrevious = () => {
    setShowExample(false) // Hide example when going back
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
    return <DemoReport reportData={reportData} leadData={leadData} onClose={onComplete} />
  }

  return (
    <div className="p-6">
      {/* Compact Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Question {currentQuestionIndex + 1}/{allQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-spark-pink to-spark-purple h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card - PROMINENT */}
      <div className="mb-6">
        <div className="mb-3 text-center">
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {currentQuestion.dimensionName}
          </span>
        </div>

        {/* Question with VERY prominent background */}
        <div className="bg-gradient-to-br from-spark-pink/10 via-spark-purple/10 to-spark-cyan/10 border-4 border-spark-pink/30 rounded-2xl p-6 shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug text-center mb-4">
            {currentQuestion.text}
          </h3>
          
          {/* Example button */}
          {currentQuestion.examples && currentQuestion.examples.length > 0 && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowExample(!showExample)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-spark-purple/10 hover:bg-spark-purple/20 text-spark-purple hover:text-spark-pink font-semibold rounded-lg border-2 border-spark-purple/30 transition-all text-sm"
              >
                <span>{showExample ? '✕' : '💡'}</span>
                <span>{showExample ? 'Hide Example' : 'Don\'t understand? Click for an example'}</span>
              </button>
              
              {showExample && (
                <div className="mt-4 p-4 bg-white/80 rounded-lg border-2 border-spark-purple/30 animate-slide-up shadow-lg">
                  <p className="text-sm text-gray-700 italic">
                    <strong>For example:</strong> {currentQuestion.examples[0]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIMPLE Slider with Single Emoji */}
        <div className="mb-8">
          <p className="text-center text-gray-600 mb-6 text-lg font-semibold">
            Slide to show how you <strong className="text-spark-pink">feel</strong>
          </p>
          
          <div className="relative py-12 px-2">
            {/* Gradient track */}
            <div className="h-6 rounded-full bg-gradient-to-r from-red-400 via-gray-300 to-green-400 shadow-lg" />
            
            {/* Single emoji that follows slider - CENTERED */}
            <div 
              className="absolute pointer-events-none transition-all duration-75 ease-out"
              style={{ 
                left: `${currentAnswer}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="text-6xl drop-shadow-2xl">
                {currentAnswer < 20 ? '😢' : 
                 currentAnswer < 35 ? '😟' : 
                 currentAnswer < 50 ? '😐' : 
                 currentAnswer < 65 ? '🙂' : 
                 currentAnswer < 85 ? '😊' : '😄'}
              </div>
            </div>
            
            {/* Slider input with LARGE clickable area - Mobile optimized */}
            <input
              type="range"
              min="0"
              max="100"
              value={currentAnswer}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className="absolute top-0 left-0 w-full h-full bg-transparent cursor-pointer z-10 touch-none"
              style={{ 
                WebkitAppearance: 'none', 
                appearance: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'none'
              }}
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-center">
              <div className="text-4xl mb-2">😢</div>
              <span className="text-sm text-gray-700 font-semibold">Strongly Disagree</span>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">😄</div>
              <span className="text-sm text-gray-700 font-semibold">Strongly Agree</span>
            </div>
          </div>
        </div>
        
        {/* COMPLETELY invisible slider - Mobile optimized! */}
        <style jsx>{`
          input[type="range"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background: transparent !important;
            outline: none !important;
            border: none !important;
            -webkit-tap-highlight-color: transparent !important;
            tap-highlight-color: transparent !important;
          }
          
          /* WebKit/iOS/Chrome - LARGE invisible thumb for touch */
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none !important;
            appearance: none !important;
            width: 100px;
            height: 100px;
            background: rgba(0, 0, 0, 0) !important;
            border: none !important;
            box-shadow: none !important;
            cursor: grab;
            opacity: 0 !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          input[type="range"]:active::-webkit-slider-thumb {
            cursor: grabbing;
          }
          input[type="range"]::-webkit-slider-runnable-track {
            height: 100%;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          /* Firefox - LARGE invisible thumb */
          input[type="range"]::-moz-range-thumb {
            width: 100px;
            height: 100px;
            background: rgba(0, 0, 0, 0) !important;
            border: none !important;
            box-shadow: none !important;
            cursor: grab;
            opacity: 0 !important;
          }
          input[type="range"]:active::-moz-range-thumb {
            cursor: grabbing;
          }
          input[type="range"]::-moz-range-track {
            height: 100%;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          input[type="range"]::-moz-range-progress {
            background: transparent !important;
          }
          
          /* Remove ALL focus/tap highlights */
          input[type="range"]:focus {
            outline: none !important;
            box-shadow: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          input[type="range"]:focus::-webkit-slider-thumb {
            outline: none !important;
            box-shadow: none !important;
          }
          input[type="range"]:focus::-moz-range-thumb {
            outline: none !important;
            box-shadow: none !important;
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


