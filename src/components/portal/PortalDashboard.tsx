'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface PortalDashboardProps {
  user: User
  profile: any
  student: any
}

export default function PortalDashboard({ user, profile, student }: PortalDashboardProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/portal/login')
    router.refresh()
  }

  // Main navigation items
  const navigationItems = [
    {
      id: 'questionnaire',
      title: 'SPARK Questionnaire',
      description: 'Complete your SPARK assessment',
      icon: '📝',
      href: '/portal/questionnaire',
      color: 'from-purple-500 to-pink-500',
      available: true,
    },
    {
      id: 'reports',
      title: 'SPARK Reports',
      description: 'View your results and set goals',
      icon: '📊',
      href: '/portal/reports',
      color: 'from-cyan-500 to-blue-500',
      available: true,
    },
    {
      id: 'activities',
      title: 'SPARK Activities',
      description: 'Your personalized growth program',
      icon: '🎮',
      href: '/portal/activities',
      color: 'from-lime-500 to-green-500',
      available: false, // Will be enabled after questionnaire
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/spark-logo.png"
                alt="SPARK"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">SPARK</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Student Portal</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* User Info - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Year {student?.year_group}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation min-h-[44px]"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.first_name}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to continue your SPARK journey?
          </p>
        </div>

        {/* Navigation Cards - Mobile First Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.available && router.push(item.href)}
              disabled={!item.available}
              className={`
                relative overflow-hidden rounded-2xl p-6 text-left transition-all
                ${item.available 
                  ? 'bg-white hover:shadow-xl hover:scale-[1.02] cursor-pointer' 
                  : 'bg-gray-100 opacity-60 cursor-not-allowed'
                }
                shadow-lg border border-gray-200
                touch-manipulation min-h-[160px] flex flex-col
              `}
            >
              {/* Gradient Header */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${item.color}`} />
              
              {/* Icon */}
              <div className="text-5xl mb-4">{item.icon}</div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>

              {/* Status Badge */}
              {!item.available && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Arrow Icon for Available Items */}
              {item.available && (
                <div className="absolute bottom-6 right-6 text-gray-400 group-hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Quick Stats - Mobile Friendly */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">1</div>
              <div className="text-xs text-gray-600 mt-1">Assessments</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg">
              <div className="text-2xl font-bold text-cyan-700">0</div>
              <div className="text-xs text-gray-600 mt-1">Activities</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
              <div className="text-2xl font-bold text-pink-700">0</div>
              <div className="text-xs text-gray-600 mt-1">Badges</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-lime-50 to-lime-100 rounded-lg">
              <div className="text-2xl font-bold text-lime-700">0</div>
              <div className="text-xs text-gray-600 mt-1">Goals</div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Getting Started</h4>
              <p className="text-sm text-blue-800">
                Start by completing your SPARK Questionnaire to unlock your personalized report and activities!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Shows on mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden safe-bottom z-40">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => router.push('/portal/dashboard')}
            className="flex flex-col items-center justify-center py-3 px-2 text-purple-600 bg-purple-50 touch-manipulation"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => router.push('/portal/questionnaire')}
            className="flex flex-col items-center justify-center py-3 px-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 touch-manipulation"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium">Quiz</span>
          </button>

          <button
            onClick={() => router.push('/portal/reports')}
            className="flex flex-col items-center justify-center py-3 px-2 text-gray-600 hover:text-cyan-600 hover:bg-gray-50 touch-manipulation"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">Reports</span>
          </button>

          <button
            onClick={() => router.push('/portal/activities')}
            className="flex flex-col items-center justify-center py-3 px-2 text-gray-600 hover:text-lime-600 hover:bg-gray-50 touch-manipulation"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            <span className="text-xs font-medium">Activities</span>
          </button>
        </div>
      </nav>

      {/* Add padding for mobile bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  )
}

