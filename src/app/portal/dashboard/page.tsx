import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile, getCurrentStudentRecord, isStudent } from '@/lib/auth/helpers'
import PortalDashboard from '@/components/portal/PortalDashboard'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/portal/login')
  }

  // Get user profile
  const profile = await getCurrentUserProfile()
  
  if (!profile) {
    redirect('/portal/login')
  }

  // Get student record if user is a student
  const studentRecord = await getCurrentStudentRecord()

  // Redirect based on role
  const userIsStudent = await isStudent()
  
  if (!userIsStudent) {
    // Staff should go to staff dashboard (we'll build this later)
    // For now, show a placeholder
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Staff Portal</h1>
          <p className="text-gray-600 mb-6">
            Welcome, {profile.first_name} {profile.last_name}!
          </p>
          <p className="text-sm text-gray-500">
            Staff dashboard coming soon...
          </p>
          <button
            onClick={async () => {
              'use server'
              const supabase = createClient()
              await supabase.auth.signOut()
              redirect('/portal/login')
            }}
            className="mt-6 bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg"
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
      student={studentRecord}
    />
  )
}

