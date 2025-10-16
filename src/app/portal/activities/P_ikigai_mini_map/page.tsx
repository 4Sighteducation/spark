'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import IkigaiWelcome from './components/IkigaiWelcome'
import IkigaiStep1 from './components/IkigaiStep1'
import IkigaiStep2 from './components/IkigaiStep2'
import IkigaiStep3 from './components/IkigaiStep3'
import IkigaiStep4 from './components/IkigaiStep4'
import IkigaiStep5 from './components/IkigaiStep5'
import IkigaiStep6 from './components/IkigaiStep6'

export default function IkigaiQuestPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0) // 0 = welcome, 1-6 = steps
  const [studentName, setStudentName] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  
  // Student's ideas across all quadrants
  const [ideas, setIdeas] = useState({
    love: [] as string[],
    goodAt: [] as string[],
    paidFor: [] as string[],
    worldNeeds: [] as string[],
    reflection: '',
  })

  const [points, setPoints] = useState(0)

  useEffect(() => {
    async function loadStudent() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        window.location.href = '/portal/login'
        return
      }

      // Get student name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', session.user.id)
        .single()
      
      if (profile) {
        setStudentName(profile.first_name)
        // Get AI welcome message from API
        const response = await fetch('/api/sensei/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentName: profile.first_name }),
        })
        const data = await response.json()
        setWelcomeMessage(data.message)
      }
    }

    loadStudent()
  }, [])

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const addIdea = (quadrant: keyof typeof ideas, idea: string) => {
    if (quadrant === 'reflection') {
      setIdeas({ ...ideas, reflection: idea })
    } else {
      if (!ideas[quadrant].includes(idea)) {
        setIdeas({
          ...ideas,
          [quadrant]: [...ideas[quadrant], idea],
        })
        setPoints(points + 5) // +5 points per idea
      }
    }
  }

  const removeIdea = (quadrant: keyof typeof ideas, index: number) => {
    if (quadrant !== 'reflection') {
      const newIdeas = [...ideas[quadrant]]
      newIdeas.splice(index, 1)
      setIdeas({
        ...ideas,
        [quadrant]: newIdeas,
      })
    }
  }

  const handleComplete = async () => {
    // Calculate final points
    const totalIdeas = ideas.love.length + ideas.goodAt.length + ideas.paidFor.length + ideas.worldNeeds.length
    const completionBonus = 50
    const finalPoints = points + completionBonus

    // TODO: Submit to database
    console.log('Ikigai Quest Complete!', { ideas, finalPoints })

    // Show completion screen
    setCurrentStep(7)
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/Japan-pink-garden.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-pink-900/30 to-purple-900/40" />

      {/* Content */}
      <div className="relative z-10">
        {currentStep === 0 && (
          <IkigaiWelcome
            studentName={studentName}
            welcomeMessage={welcomeMessage}
            onStart={handleNext}
          />
        )}

        {currentStep === 1 && (
          <IkigaiStep1
            ideas={ideas.love}
            addIdea={(idea) => addIdea('love', idea)}
            removeIdea={(index) => removeIdea('love', index)}
            onNext={handleNext}
            onBack={handlePrevious}
            points={points}
          />
        )}

        {currentStep === 2 && (
          <IkigaiStep2
            ideas={ideas.goodAt}
            previousIdeas={ideas.love}
            addIdea={(idea) => addIdea('goodAt', idea)}
            removeIdea={(index) => removeIdea('goodAt', index)}
            onNext={handleNext}
            onBack={handlePrevious}
            points={points}
          />
        )}

        {currentStep === 3 && (
          <IkigaiStep3
            allIdeas={ideas}
            reflection={ideas.reflection}
            setReflection={(text) => addIdea('reflection', text)}
            onNext={handleNext}
            onBack={handlePrevious}
            points={points}
          />
        )}

        {currentStep === 4 && (
          <IkigaiStep4
            ideas={ideas.paidFor}
            previousIdeas={{ love: ideas.love, goodAt: ideas.goodAt }}
            addIdea={(idea) => addIdea('paidFor', idea)}
            removeIdea={(index) => removeIdea('paidFor', index)}
            onNext={handleNext}
            onBack={handlePrevious}
            points={points}
          />
        )}

        {currentStep === 5 && (
          <IkigaiStep5
            ideas={ideas.worldNeeds}
            allPreviousIdeas={ideas}
            addIdea={(idea) => addIdea('worldNeeds', idea)}
            removeIdea={(index) => removeIdea('worldNeeds', index)}
            onNext={handleNext}
            onBack={handlePrevious}
            points={points}
          />
        )}

        {currentStep === 6 && (
          <IkigaiStep6
            allIdeas={ideas}
            onComplete={handleComplete}
            onBack={handlePrevious}
            points={points}
          />
        )}

        {currentStep === 7 && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 max-w-2xl text-center shadow-2xl">
              <div className="text-8xl mb-6">🎌</div>
              <h1 className="text-5xl font-bold text-purple-900 mb-4">
                Ikigai Quest Complete!
              </h1>
              <p className="text-2xl text-gray-700 mb-8">
                You've discovered your reason for being, {studentName}!
              </p>
              <div className="text-6xl font-bold text-purple-600 mb-2">
                {points} Points
              </div>
              <p className="text-gray-600 mb-8">Amazing work exploring your purpose!</p>
              <button
                onClick={() => router.push('/portal/activities')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl text-xl hover:opacity-90 transition-all shadow-lg"
              >
                Return to Activities
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

