'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import PortalDashboard from '@/components/portal/PortalDashboard'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserData() {
      console.log('Dashboard: Loading user data...')
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No session, redirecting to login')
        window.location.href = '/portal/login'
        return
      }
      
      setUser(session.user)
      console.log('User loaded:', session.user.email)
      
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      console.log('Profile query:', { data: profileData, error: profileError })
      
      if (profileError) {
        console.error('❌ Profile error:', profileError)
        alert('Profile Error: ' + profileError.message + '\n\nThis is likely an RLS policy issue.')
      }
      
      setProfile(profileData)
      
      // Get student record
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      console.log('Student loaded:', studentData)
      setStudent(studentData)
      
      setLoading(false)
    }
    
    loadUserData()
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

  if (!user || !profile) {
    return null
  }

  // Staff placeholder
  if (profile.primary_role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Staff Portal</h1>
          <p className="text-gray-600 mb-6">
            Welcome, {profile.first_name} {profile.last_name}!
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Staff dashboard coming soon...
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/portal/login'
            }}
            className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // Student dashboard
  return (
    <PortalDashboard 
      user={user}
      profile={profile}
      student={student}
    />
  )
}

