'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { calculateAssessmentScores } from '@/lib/scoring/calculate'
import questionnaireData from '@/data/questionnaire.json'

interface PortalQuestionnaireProps {
  student: any
  cycleInfo: any
}

export default function PortalQuestionnaire({ student, cycleInfo }: PortalQuestionnaireProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showExample, setShowExample] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
    setShowExample(false)
    
    // Save current answer if not already saved
    if (!answers[currentQuestion.id]) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: currentAnswer,
      })
    }
    
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Submit questionnaire
      setTimeout(() => {
        submitQuestionnaire()
      }, 100)
    }
  }

  const handlePrevious = () => {
    setShowExample(false)
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const submitQuestionnaire = async () => {
    setSubmitting(true)

    console.log('🔄 Submitting questionnaire...', {
      answersCount: Object.keys(answers).length,
      cycleId: cycleInfo.id,
      cycleNumber: cycleInfo.cycle_number,
    })

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Session expired. Please login again.')
        window.location.href = '/portal/login'
        return
      }

      // Get active questionnaire
      const { data: questionnaire, error: questError } = await supabase
        .from('questionnaires')
        .select('id')
        .eq('is_default', true)
        .eq('status', 'active')
        .single()

      if (questError || !questionnaire) {
        console.error('No active questionnaire:', questError)
        alert('No active questionnaire found. Please contact support.')
        setSubmitting(false)
        return
      }

      console.log('📝 Creating questionnaire response...')

      // Create questionnaire response
      const { data: response, error: responseError } = await supabase
        .from('questionnaire_responses')
        .insert({
          student_id: student.id,
          questionnaire_id: questionnaire.id,
          organization_id: student.organization_id,
          cycle_id: cycleInfo.id,
          cycle_number: cycleInfo.cycle_number,
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (responseError) {
        console.error('❌ Error creating response:', responseError)
        alert(`Failed to save questionnaire response.\n\nError: ${responseError.message}`)
        setSubmitting(false)
        return
      }

      console.log('✅ Response created:', response.id)

      // Save individual answers
      const questionAnswers = Object.entries(answers).map(([questionId, sliderValue]) => {
        const dimension = questionId.charAt(0) as 'S' | 'P' | 'A' | 'R' | 'K'
        return {
          response_id: response.id,
          question_id: questionId,
          dimension,
          slider_value: sliderValue as number,
        }
      })

      const { error: answersError } = await supabase
        .from('question_answers')
        .insert(questionAnswers)

      if (answersError) {
        console.error('❌ Error saving answers:', answersError)
        alert(`Failed to save answers.\n\nError: ${answersError.message}`)
        setSubmitting(false)
        return
      }

      console.log('✅ Answers saved:', questionAnswers.length)

      // Calculate scores
      const scores = calculateAssessmentScores(questionAnswers)
      console.log('📊 Scores calculated:', scores)

      // Save assessment results
      const { data: assessmentResult, error: resultError } = await supabase
        .from('assessment_results')
        .insert({
          response_id: response.id,
          student_id: student.id,
          organization_id: student.organization_id,
          self_direction_score: scores.self_direction.score,
          purpose_score: scores.purpose.score,
          awareness_score: scores.awareness.score,
          resilience_score: scores.resilience.score,
          knowledge_score: scores.knowledge.score,
          overall_score: scores.overall.score,
          self_direction_band: scores.self_direction.band,
          purpose_band: scores.purpose.band,
          awareness_band: scores.awareness.band,
          resilience_band: scores.resilience.band,
          knowledge_band: scores.knowledge.band,
          overall_band: scores.overall.band,
          report_data: {
            scores,
            cycle_number: cycleInfo.cycle_number,
            completed_at: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (resultError) {
        console.error('❌ Error saving results:', resultError)
        alert(`Failed to save assessment results.\n\nError: ${resultError.message}`)
        setSubmitting(false)
        return
      }

      console.log('✅ Assessment complete! Results saved:', assessmentResult.id)
      
      // Success! Redirect to reports page
      alert('✅ Questionnaire complete! Viewing your results...')
      router.push('/portal/reports')
      router.refresh()
      
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      alert(`An unexpected error occurred.\n\nError: ${error}\n\nPlease try again or contact support.`)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            SPARK Questionnaire
          </h1>
          <p className="text-sm text-gray-600">
            {cycleInfo.cycle_name} • Answer honestly - there are no right or wrong answers!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Question {currentQuestionIndex + 1}/{allQuestions.length}</span>
            <span className="font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 mb-6">
          {/* Dimension Label */}
          <div className="text-center mb-4">
            <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full">
              {currentQuestion.dimensionName}
            </span>
          </div>

          {/* Question Text */}
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 border-4 border-purple-200 rounded-xl p-6 md:p-8 mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 leading-snug text-center">
              {currentQuestion.text}
            </h2>
            
            {/* Example Button */}
            {currentQuestion.examples && currentQuestion.examples.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowExample(!showExample)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold rounded-lg border-2 border-purple-300 transition-all text-sm md:text-base touch-manipulation min-h-[44px]"
                >
                  <span>{showExample ? '✕' : '💡'}</span>
                  <span>{showExample ? 'Hide Example' : 'Need an example?'}</span>
                </button>
                
                {showExample && (
                  <div className="mt-4 p-4 md:p-6 bg-white rounded-lg border-2 border-purple-300 shadow-lg animate-fade-in">
                    <p className="text-sm md:text-base text-gray-700 italic leading-relaxed">
                      <strong>For example:</strong> {currentQuestion.examples[0]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Emoji Slider */}
          <div className="mb-8">
            <p className="text-center text-gray-700 mb-6 text-lg font-semibold">
              Slide the emoji to show how you <span className="text-purple-600">feel</span>
            </p>
            
            <div className="relative py-12 px-2">
              {/* Gradient track */}
              <div className="h-6 md:h-8 rounded-full bg-gradient-to-r from-red-400 via-yellow-300 to-green-400 shadow-lg" />
              
              {/* Emoji that follows slider */}
              <div 
                className="absolute pointer-events-none transition-all duration-75 ease-out"
                style={{ 
                  left: `${currentAnswer}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-5xl md:text-6xl drop-shadow-2xl filter brightness-110">
                  {currentAnswer < 20 ? '😢' : 
                   currentAnswer < 35 ? '😟' : 
                   currentAnswer < 50 ? '😐' : 
                   currentAnswer < 65 ? '🙂' : 
                   currentAnswer < 85 ? '😊' : '😄'}
                </div>
              </div>
              
              {/* Slider input - invisible but large touch target */}
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

            {/* Scale Labels */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="text-center flex-1">
                <div className="text-3xl md:text-4xl mb-2">😢</div>
                <span className="text-xs md:text-sm text-gray-700 font-semibold">Strongly Disagree</span>
              </div>
              <div className="text-center flex-1">
                <div className="text-3xl md:text-4xl mb-2">😄</div>
                <span className="text-xs md:text-sm text-gray-700 font-semibold">Strongly Agree</span>
              </div>
            </div>
          </div>

          {/* Invisible slider styles */}
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
            
            input[type="range"]:focus {
              outline: none !important;
              box-shadow: none !important;
            }
          `}</style>

          {/* Navigation Buttons */}
          <div className="flex gap-3 md:gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 md:px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[48px] md:min-h-[44px]"
            >
              ← Previous
            </button>

            <button
              onClick={handleNext}
              disabled={submitting}
              className="flex-1 px-6 md:px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px] md:min-h-[44px]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : currentQuestionIndex === allQuestions.length - 1 ? (
                '✨ See My Results →'
              ) : (
                'Next →'
              )}
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            <strong className="text-purple-600">{Object.keys(answers).length}</strong> of <strong>{allQuestions.length}</strong> questions answered
          </p>
        </div>
      </div>
    </div>
  )
}

