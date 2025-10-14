'use client'

import { useState } from 'react'
import Image from 'next/image'

interface DemoReportProps {
  reportData: any
  leadData: {
    name: string
    email: string
    school: string
    role: string
  }
  onClose: () => void
}

export function DemoReport({ reportData, leadData, onClose }: DemoReportProps) {
  const [emailSent, setEmailSent] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailFormData, setEmailFormData] = useState({
    name: leadData.name,
    email: leadData.email
  })
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const dimensions = [
    { 
      key: 'self_direction', 
      label: 'Self-Direction', 
      subtitle: 'Taking initiative and being pro-active',
      color: '#E91E8C', 
      icon: '/icon-self-direction.png' 
    },
    { 
      key: 'purpose', 
      label: 'Purpose', 
      subtitle: 'Hope, aspirations and your sense of purpose',
      color: '#7C3AED', 
      icon: '/icon-purpose.png' 
    },
    { 
      key: 'awareness', 
      label: 'Awareness', 
      subtitle: 'Working with others, empathy and fostering relationships',
      color: '#06B6D4', 
      icon: '/icon-awareness.png' 
    },
    { 
      key: 'resilience', 
      label: 'Resilience', 
      subtitle: 'Diligence, reliability, never giving up',
      color: '#84CC16', 
      icon: '/icon-resilience.png' 
    },
    { 
      key: 'knowledge', 
      label: 'Knowledge', 
      subtitle: 'Curiosity, attention, role of student',
      color: '#FBBF24', 
      icon: '/icon-knowledge.png' 
    },
  ]

  const handleEmailReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingEmail(true)

    try {
      const response = await fetch('/api/leads/email-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: emailFormData.name,
          email: emailFormData.email,
          school: leadData.school,
          role: leadData.role,
          reportData,
        }),
      })
      
      if (response.ok) {
        setEmailSent(true)
        setShowEmailModal(false)
        setTimeout(() => setEmailSent(false), 5000)
      } else {
        alert('Failed to send email. Please try again.')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Network error. Please check your connection.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
      {/* Celebration Header */}
      <div className="bg-gradient-to-r from-spark-pink via-spark-purple to-spark-cyan p-8 text-white text-center">
        <div className="text-6xl mb-4 animate-bounce-gentle">🎉</div>
        <h2 className="text-4xl font-bold mb-3">Congratulations, {leadData.name}!</h2>
        <p className="text-xl opacity-95">Here's your personalized SPARK report</p>
      </div>

      {/* Overall Score */}
      <div className="p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Your Overall SPARK Score</h3>
            <p className="text-gray-600">Average across all five dimensions</p>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90" width="192" height="192">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#overallGradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(reportData.scores.overall.score / 10) * 553} 553`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E91E8C" />
                    <stop offset="50%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-gray-900">
                  {reportData.scores.overall.score.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500 uppercase font-bold tracking-wide mt-2">
                  {reportData.scores.overall.band.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dimension Scores - Styled like sample report */}
      {dimensions.map((dim, index) => {
        const score = reportData.scores[dim.key]
        return (
          <div 
            key={dim.key} 
            className="p-8 border-b-4"
            style={{ 
              backgroundColor: `${dim.color}08`,
              borderColor: `${dim.color}40`
            }}
          >
            <div className="max-w-4xl mx-auto">
              {/* Score header */}
              <div className="flex items-center gap-6 mb-6">
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl p-4"
                  style={{ backgroundColor: dim.color }}
                >
                  <Image 
                    src={dim.icon} 
                    alt={dim.label} 
                    width={64} 
                    height={64} 
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{dim.label}</h3>
                  <p className="text-gray-600 italic text-sm mb-3">{dim.subtitle}</p>
                  <div className="flex items-baseline gap-3">
                    <div className="text-5xl font-bold" style={{ color: dim.color }}>
                      {score.score.toFixed(1)}
                    </div>
                    <div className="text-lg font-bold uppercase tracking-wide" style={{ color: dim.color }}>
                      {score.band.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 shadow-lg"
                    style={{ 
                      width: `${(score.score / 10) * 100}%`,
                      backgroundColor: dim.color
                    }}
                  />
                </div>
              </div>

              {/* Feedback box */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-4" style={{ borderColor: `${dim.color}60` }}>
                <p className="text-gray-800 leading-relaxed mb-4">
                  {reportData.statements[dim.key]?.statement || 
                   `You show strong ${dim.label.toLowerCase()} skills. Keep developing these strengths!`}
                </p>
                
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: `${dim.color}10` }}>
                  <p className="text-sm font-bold mb-2" style={{ color: dim.color }}>
                    💭 Personal Development Question:
                  </p>
                  <p className="text-sm text-gray-700 italic">
                    {reportData.statements[dim.key]?.personal_development_question ||
                     `How can you continue growing your ${dim.label.toLowerCase()} abilities?`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* CTA Footer */}
      <div className="p-8 bg-gradient-to-r from-spark-pink via-spark-purple to-spark-cyan text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Want the Full SPARK Experience?</h3>
        <p className="text-lg mb-6 opacity-95 max-w-2xl mx-auto">
          Imagine this for every student in your school—personalized reports, 40 interactive activities, 
          real-time dashboards, and longitudinal progress tracking.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={() => emailSent ? null : setShowEmailModal(true)}
            disabled={emailSent}
            className="px-8 py-4 bg-white text-spark-pink text-lg rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-2xl disabled:opacity-70"
          >
            {emailSent ? '✅ Email Sent Successfully!' : '📧 Email Me This Report'}
          </button>
          
          <button
            onClick={onClose}
            className="px-8 py-4 bg-white/20 text-white text-lg rounded-lg font-bold hover:bg-white/30 transition-colors border-2 border-white/50"
          >
            Close Report
          </button>
        </div>
        
        <p className="text-sm opacity-90">
          We'll contact you when SPARK launches for schools!
        </p>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEmailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">📧 Email Your Report</h3>
            <p className="text-gray-600 mb-6">We'll send your personalized SPARK report to your email</p>
            
            <form onSubmit={handleEmailReport} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  value={emailFormData.name}
                  onChange={(e) => setEmailFormData({ ...emailFormData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-spark-pink focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={emailFormData.email}
                  onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-spark-pink focus:outline-none"
                  required
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-spark-pink to-spark-purple text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSendingEmail ? 'Sending...' : 'Send Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

