'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SimpleDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      console.log('SimpleDashboard: Checking session...')
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('SimpleDashboard: Session check result:', { session: !!session, error })
      
      if (session && session.user) {
        console.log('✅ User found:', session.user.email)
        setUser(session.user)
      } else {
        console.log('❌ No session, redirecting to login...')
        window.location.href = '/portal/login'
      }
      
      setLoading(false)
    }
    
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600 text-xl">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4 text-center">🎉</div>
          <h1 className="text-4xl font-bold mb-4 text-center">✅ Login Successful!</h1>
          <p className="text-gray-600 mb-2 text-center text-xl">
            Welcome, <strong>{user.email}</strong>!
          </p>
          <p className="text-sm text-gray-500 mb-8 text-center">
            User ID: {user.id}
          </p>
          
          <div className="space-y-3">
            <Link
              href="/portal/dashboard"
              className="block px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 text-center text-lg"
            >
              🏠 Go to Full Dashboard
            </Link>
            <Link
              href="/portal/reports"
              className="block px-6 py-4 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 text-center text-lg"
            >
              📊 View Reports
            </Link>
            <Link
              href="/portal/activities"
              className="block px-6 py-4 bg-lime-600 text-white font-semibold rounded-lg hover:bg-lime-700 text-center text-lg"
            >
              🎮 View Activities
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/portal/login'
              }}
              className="w-full px-6 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 text-center text-lg"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


