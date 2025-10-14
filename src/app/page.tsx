'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { DemoQuestionnaire } from '@/components/demo/DemoQuestionnaire'

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    school: '',
    role: '',
  })
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple validation - just show questionnaire
    // We'll save to database AFTER they complete it (in DemoQuestionnaire component)
    if (!leadFormData.name || !leadFormData.email) {
      alert('Please fill in all required fields')
      return
    }
    
    setShowQuestionnaire(true)
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          school: formData.get('school'),
          role: formData.get('role'),
        }),
      })

      if (response.ok) {
        alert('✅ Thank you! You\'re on the waitlist. We\'ll be in touch soon!')
        ;(e.target as HTMLFormElement).reset()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to submit. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting waitlist:', error)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-spark-pink via-spark-purple to-spark-cyan text-white py-3 px-4 text-center font-semibold sticky top-0 z-50 shadow-lg">
        🎉 <strong>Limited Offer:</strong> The first 20 schools to express interest will receive FREE access for the entire first year! 🎉
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-spark-pink rounded-full blur-3xl animate-pulse-gentle" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-spark-purple rounded-full blur-3xl animate-pulse-gentle" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-spark-cyan rounded-full blur-3xl animate-pulse-gentle" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
          {/* Logo - Enhanced Hero Treatment */}
          <div className="flex justify-center mb-16 animate-scale-in">
            <div className="relative group">
              {/* Multiple glow effect layers for spectacular effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-spark-pink via-spark-purple to-spark-cyan rounded-full blur-[100px] opacity-70 group-hover:opacity-90 transition-opacity duration-500 scale-125 animate-pulse-gentle" />
              <div className="absolute inset-0 bg-gradient-to-r from-spark-cyan via-spark-purple to-spark-pink rounded-full blur-[80px] opacity-50 group-hover:opacity-70 transition-opacity duration-500 scale-115 animate-pulse-gentle" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-0 bg-gradient-to-r from-spark-yellow via-spark-lime to-spark-pink rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity duration-500 scale-110 animate-pulse-gentle" style={{ animationDelay: '1s' }} />
              
              {/* Logo - Larger! */}
              <div className="relative">
                <Image
                  src="/spark-logo.png"
                  alt="SPARK - Developing Student Mindset"
                  width={500}
                  height={500}
                  priority
                  className="drop-shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500 filter brightness-110"
                />
              </div>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up">
            A breakthrough psychometric tool for <strong className="text-spark-pink">Key Stage 3 students</strong> (ages 11-14), 
            measuring the attributes that truly matter for student success.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => setShowDemo(true)}
              className="px-12 py-6 bg-spark-pink text-white text-xl rounded-full font-bold hover:bg-spark-pink-600 transition-all shadow-spark hover:shadow-2xl hover:scale-105"
            >
              Try the Demo
            </button>
            
            <a
              href="#learn-more"
              className="px-12 py-6 bg-white/10 text-white text-xl rounded-full font-semibold hover:bg-white/20 transition-all border-2 border-white/30 backdrop-blur-sm hover:scale-105"
            >
              Learn More
            </a>

            {/* TEST BUTTON - Remove before launch */}
            <button
              onClick={() => {
                setLeadFormData({
                  name: 'Test User',
                  email: 'test@example.com',
                  school: 'Test School',
                  role: 'Headteacher'
                })
                setShowDemo(true)
                setShowQuestionnaire(true)
              }}
              className="px-6 py-3 bg-yellow-500 text-black text-sm rounded-lg font-bold hover:bg-yellow-400 transition-all border-2 border-yellow-300"
            >
              🧪 TEST (Skip Form)
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce-gentle">
            <svg className="w-6 h-6 mx-auto text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* What is SPARK Section - Redesigned */}
      <section id="learn-more" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              What is <span className="text-spark-pink">SPARK</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4">
              Building on the success of the VESPA Questionnaire, SPARK delves into the key attributes 
              that contribute to student success and learner effectiveness.
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto italic">
              Developed through rigorous psychometric analysis with Manchester Metropolitan University
            </p>
          </div>

          {/* 5 Dimensions Grid - Better 2x3 Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
            {[
              {
                letter: 'S',
                name: 'Self-direction',
                description: 'Initiative, proactiveness, and a bias toward action.',
                color: 'spark-pink',
                gradient: 'from-spark-pink-400 to-spark-pink-600',
                alpha: '0.73',
                questions: [
                  'I am willing to risk failure to reach my goals',
                  'When I work at something, I care about doing my best',
                  'I make plans that help me accomplish what I aim for'
                ]
              },
              {
                letter: 'P',
                name: 'Purpose',
                description: 'Hope, aspirations, and sense of direction.',
                color: 'spark-purple',
                gradient: 'from-spark-purple-400 to-spark-purple-600',
                alpha: '0.84',
                questions: [
                  'I expect good things to happen to me',
                  'I am excited about my future',
                  'My life will make a difference in the world'
                ]
              },
              {
                letter: 'A',
                name: 'Awareness',
                description: 'Empathy, relationships, and understanding others.',
                color: 'spark-cyan',
                gradient: 'from-spark-cyan-400 to-spark-cyan-600',
                alpha: '0.81',
                questions: [
                  'I feel bad when someone gets their feelings hurt',
                  'I understand how those close to me feel',
                  'I go out of my way to help others'
                ]
              },
              {
                letter: 'R',
                name: 'Resilience',
                description: 'Grit, perseverance, and reliability.',
                color: 'spark-lime',
                gradient: 'from-spark-lime-400 to-spark-lime-600',
                alpha: '0.81',
                questions: [
                  'I see tasks through to completion even when I encounter obstacles',
                  'People can count on me to get tasks done',
                  'I persist and find ways to overcome challenges'
                ]
              },
              {
                letter: 'K',
                name: 'Knowledge',
                description: 'Curiosity, attention, and valuing education.',
                color: 'spark-yellow',
                gradient: 'from-spark-yellow-400 to-spark-yellow-600',
                alpha: '0.85',
                questions: [
                  'If something interests me, I try to learn more about it',
                  'I care about doing well in school',
                  'I always pay attention in class'
                ]
              },
            ].map((dimension, index) => (
              <div
                key={dimension.letter}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border-2 border-gray-100 hover:border-transparent hover:-translate-y-2 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${dimension.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
                
                <div className="flex items-start gap-6 mb-4">
                  <div className={`w-24 h-24 bg-gradient-to-br ${dimension.gradient} rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {dimension.letter}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {dimension.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono mb-2">α = {dimension.alpha}</p>
                    <p className="text-gray-600 leading-relaxed">
                      {dimension.description}
                    </p>
                  </div>
                </div>

                {/* Hover popup with example questions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Example Questions:</p>
                  <ul className="space-y-1">
                    {dimension.questions.map((q, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start">
                        <span className={`text-${dimension.color} mr-2`}>•</span>
                        <span>"{q}"</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Summary Card */}
          <div className="bg-gradient-to-r from-spark-pink via-spark-purple to-spark-cyan rounded-2xl shadow-2xl p-10 text-white max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-4xl font-bold mb-6">Comprehensive 360° View</h3>
              <p className="text-xl leading-relaxed opacity-95 mb-6">
                SPARK provides a holistic view of each student's mindset, combining all five dimensions 
                to deliver actionable insights that help educators tailor support and interventions.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-8 text-center">
                <div>
                  <div className="text-5xl font-bold">33</div>
                  <div className="text-sm opacity-90">Questions</div>
                </div>
                <div>
                  <div className="text-5xl font-bold">10</div>
                  <div className="text-sm opacity-90">Minutes</div>
                </div>
                <div>
                  <div className="text-5xl font-bold">5</div>
                  <div className="text-sm opacity-90">Dimensions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* See It In Action - Report Screenshots */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              See <span className="text-spark-purple">SPARK</span> in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beautiful, personalized reports that students and teachers actually want to read
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border-4 border-gray-200">
              <Image
                src="/spark-report-sample.png"
                alt="SPARK Report Example"
                width={1000}
                height={1400}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <p className="text-center text-gray-500 mt-6 text-lg">
              <strong>Personalized feedback</strong> for each dimension with reflection questions and suggested activities
            </p>
          </div>
        </div>
      </section>

      {/* Research Validation Section - Enhanced */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Research-Validated & <span className="text-spark-purple">Psychometrically Sound</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
              SPARK isn't just another questionnaire - it's built on rigorous psychometric research.
            </p>
            <p className="text-lg text-gray-500 italic">
              Manchester Metropolitan University · Preliminary Findings & Future Directions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-spark-pink">
              <div className="text-6xl font-bold text-spark-pink mb-2">190</div>
              <p className="text-gray-700 font-semibold text-lg">Students in Pilot Study</p>
              <p className="text-sm text-gray-500 mt-2">Key Stage 3 · Ages 11-14</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-spark-purple">
              <div className="text-6xl font-bold text-spark-purple mb-2">0.81-0.89</div>
              <p className="text-gray-700 font-semibold text-lg">Cronbach's Alpha Range</p>
              <p className="text-sm text-gray-500 mt-2">Excellent reliability across dimensions</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-spark-cyan">
              <div className="text-6xl font-bold text-spark-cyan mb-2">5</div>
              <p className="text-gray-700 font-semibold text-lg">Validated Factors</p>
              <p className="text-sm text-gray-500 mt-2">Confirmed through exploratory factor analysis</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-10 max-w-4xl mx-auto border-2 border-gray-200">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Rigorous Development Process</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Strong Constructs:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-spark-pink mr-2 text-xl">✓</span>
                    <span><strong>Purpose</strong> (α = 0.84) - Exceptional reliability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-spark-purple mr-2 text-xl">✓</span>
                    <span><strong>Awareness</strong> (α = 0.81) - Strong measurement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-spark-cyan mr-2 text-xl">✓</span>
                    <span><strong>Knowledge</strong> (α = 0.85) - Robust validity</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Methodological Rigor:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-spark-lime mr-2 text-xl">✓</span>
                    <span><strong>Factor Analysis</strong> confirms 5-factor structure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-spark-yellow mr-2 text-xl">✓</span>
                    <span><strong>Item loadings</strong> 1.0-1.7 (strong indicators)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-spark-pink mr-2 text-xl">✓</span>
                    <span><strong>100-point slider</strong> for enhanced fidelity</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Activities Section - NEW */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              40 Engaging <span className="text-spark-lime">Activities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Research-backed interventions automatically suggested based on student scores
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Two-Minute Takeoff',
                dimension: 'Self-Direction',
                color: 'spark-pink',
                time: '10 min',
                description: 'Beat procrastination by shrinking the first step to something you can do immediately, creating momentum.',
                icon: '🚀'
              },
              {
                title: 'Purpose Circles',
                dimension: 'Purpose',
                color: 'spark-purple',
                time: '20 min',
                description: 'Keep purpose central while allowing goals to change as students learn and grow.',
                icon: '🎯'
              },
              {
                title: 'Listening Ladders',
                dimension: 'Awareness',
                color: 'spark-cyan',
                time: '15 min',
                description: 'Practice deep listening and separate ideas from people to improve group learning.',
                icon: '👂'
              },
              {
                title: 'Recovery Reframes',
                dimension: 'Resilience',
                color: 'spark-lime',
                time: '15 min',
                description: 'Bounce back faster after setbacks by replacing first thoughts with balanced reframes.',
                icon: '💪'
              },
              {
                title: 'Curiosity Tickets',
                dimension: 'Knowledge',
                color: 'spark-yellow',
                time: '12 min',
                description: 'Build student identity and independent inquiry with quick "fact + wonder" exercises.',
                icon: '💡'
              },
              {
                title: 'Feynman Flip',
                dimension: 'Knowledge',
                color: 'spark-yellow',
                time: '15 min',
                description: 'Explain complex ideas simply to expose and fix gaps in understanding.',
                icon: '📚'
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-transparent hover:-translate-y-1"
              >
                <div className="text-5xl mb-4">{activity.icon}</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-${activity.color} mb-3`}>
                  {activity.dimension}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-500 mb-3">⏱️ {activity.time}</p>
                <p className="text-gray-600 leading-relaxed text-sm">{activity.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 text-lg mb-4">
              <strong>40 activities total</strong> - 8 for each dimension, automatically suggested based on student scores
            </p>
            <p className="text-gray-500">
              Mix of interactive, reflective, and game-based activities designed for 11-14 year olds
            </p>
          </div>
        </div>
      </section>

      {/* Benefits for Educators Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Empowering <span className="text-spark-pink">Educators</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SPARK provides actionable insights that help you support every student's growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Identify Strengths & Growth Areas',
                description: 'Understand each student\'s unique profile across all five dimensions with clear, personalized reports.',
              },
              {
                icon: '🛠️',
                title: 'Tailor Interventions',
                description: 'Access a library of 40 research-backed activities, automatically suggested based on student scores.',
              },
              {
                icon: '📈',
                title: 'Foster Growth Mindset',
                description: 'Help students understand their own learning journey with age-appropriate feedback and reflection tools.',
              },
              {
                icon: '🏫',
                title: 'Create Supportive Environments',
                description: 'Use class and year-level dashboards to identify patterns and inform whole-school approaches.',
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="text-6xl mb-4">{benefit.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Simple, Engaging, <span className="text-spark-purple">Effective</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Students Complete Assessment',
                description: 'Modern slider interface (not boring tick-boxes!) makes it engaging for 11-14 year olds. Takes just 10 minutes.',
                color: 'spark-pink',
              },
              {
                step: '2',
                title: 'Instant Personalized Reports',
                description: 'Students receive immediate feedback with scores, personalized statements, and reflection prompts.',
                color: 'spark-purple',
              },
              {
                step: '3',
                title: 'Targeted Activities & Tracking',
                description: 'Teachers assign gamified activities and track progress. Students set goals and reflect on growth.',
                color: 'spark-cyan',
              },
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className={`absolute -top-6 -left-6 w-16 h-16 bg-${step.color} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {step.step}
                </div>
                <div className="bg-white rounded-xl shadow-lg p-8 pt-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try Demo Section */}
      <section className="py-20 bg-gradient-to-r from-spark-pink via-spark-purple to-spark-cyan text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Experience SPARK Yourself</h2>
          <p className="text-xl mb-8 opacity-90">
            Try our demo questionnaire and see what your students will experience. 
            Get your personalized SPARK report instantly!
          </p>
          
          <button
            onClick={() => setShowDemo(true)}
            className="px-12 py-6 bg-white text-spark-pink text-xl rounded-full font-bold hover:bg-gray-100 transition-all shadow-2xl hover:scale-105"
          >
            Try the Demo Now →
          </button>
        </div>
      </section>

      {/* Sign Up Section */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Get <span className="text-spark-purple">Early Access</span>
            </h2>
            <p className="text-xl text-gray-600">
              Join our waitlist and be the first to bring SPARK to your school.
            </p>
          </div>

          <form onSubmit={handleWaitlistSubmit} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Your Name"
                className="w-full px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-spark-pink focus:outline-none text-lg"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                className="w-full px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-spark-pink focus:outline-none text-lg"
                required
              />
              <input
                name="school"
                type="text"
                placeholder="School Name"
                className="w-full px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-spark-pink focus:outline-none text-lg"
                required
              />
              <select
                name="role"
                className="w-full px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-spark-pink focus:outline-none text-lg text-gray-700"
                required
              >
                <option value="">Your Role...</option>
                <option>Headteacher</option>
                <option>Deputy Head</option>
                <option>Head of Year</option>
                <option>Teacher</option>
                <option>SENCO</option>
                <option>Other</option>
              </select>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-5 bg-gradient-to-r from-spark-pink to-spark-purple text-white text-xl rounded-lg font-bold hover:opacity-90 transition-all shadow-spark disabled:opacity-50"
              >
                {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
              </button>
            </div>
            
            <p className="text-sm text-gray-500 text-center mt-6">
              We'll never spam you. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold mb-4 text-spark-pink">SPARK</h4>
              <p className="text-gray-400 leading-relaxed">
                Developing student mindset for Key Stage 3.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#learn-more" className="hover:text-spark-pink transition-colors">About SPARK</a></li>
                <li><a href="https://www.vespa.academy" target="_blank" rel="noopener" className="hover:text-spark-pink transition-colors">VESPA Academy</a></li>
                <li><Link href="/app/login" className="hover:text-spark-pink transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-4">Contact</h4>
              <p className="text-gray-400">
                4Sight Education Ltd<br />
                <a href="mailto:info@4sighteducation.com" className="hover:text-spark-pink transition-colors">
                  info@4sighteducation.com
                </a>
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 4Sight Education Ltd. All rights reserved.</p>
            <p className="mt-2">Ages 11-14 · Key Stage 3 · Powered by 4Sight Education</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-3xl font-bold text-gray-900">Try SPARK Demo</h3>
              <button
                onClick={() => setShowDemo(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            {!showQuestionnaire ? (
              <form onSubmit={handleLeadSubmit} className="p-8">
                <p className="text-gray-600 mb-6 text-lg">
                  Experience SPARK firsthand! Complete the demo and receive your personalized report.
                </p>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                    className="w-full px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-spark-pink focus:outline-none text-lg"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                    className="w-full px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-spark-pink focus:outline-none text-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="School Name *"
                    value={leadFormData.school}
                    onChange={(e) => setLeadFormData({ ...leadFormData, school: e.target.value })}
                    className="w-full px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-spark-pink focus:outline-none text-lg"
                    required
                  />
                  <select
                    value={leadFormData.role}
                    onChange={(e) => setLeadFormData({ ...leadFormData, role: e.target.value })}
                    className="w-full px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-spark-pink focus:outline-none text-lg text-gray-700"
                    required
                  >
                    <option value="">Your Role... *</option>
                    <option>Headteacher</option>
                    <option>Deputy Head</option>
                    <option>Head of Year</option>
                    <option>Teacher</option>
                    <option>SENCO</option>
                    <option>Parent</option>
                    <option>Other Education Professional</option>
                  </select>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-5 bg-gradient-to-r from-spark-pink to-spark-purple text-white text-xl rounded-lg font-bold hover:opacity-90 transition-all shadow-spark disabled:opacity-50"
                  >
                    {isSubmitting ? 'Starting...' : 'Start Demo →'}
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 text-center mt-6">
                  Your information helps us tailor the demo experience. We'll also keep you updated on SPARK's launch.
                </p>
              </form>
            ) : (
              <DemoQuestionnaire 
                leadData={leadFormData} 
                onComplete={() => {
                  setShowDemo(false)
                  setShowQuestionnaire(false)
                  setLeadFormData({ name: '', email: '', school: '', role: '' })
                }}
              />
            )}
          </div>
        </div>
      )}
    </main>
  )
}

