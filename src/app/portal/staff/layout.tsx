'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface StaffLayoutProps {
  children: React.ReactNode
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserData() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        window.location.href = '/portal/login?redirect=/portal/staff'
        return
      }
      
      // Get profile with role check
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single() as { data: any; error: any }
      
      if (error || !profileData) {
        console.error('Profile error:', error)
        window.location.href = '/portal/login'
        return
      }

      // Check if user is staff (not a student)
      if (profileData.primary_role === 'student') {
        // Students should go to student portal
        window.location.href = '/portal/dashboard'
        return
      }

      setUser(session.user)
      setProfile(profileData)
      setLoading(false)
    }
    
    loadUserData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/portal/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600 text-xl">Loading staff portal...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  // Navigation items based on role
  const navItems = [
    { href: '/portal/staff/coaching', label: 'Coaching', icon: '💬', roles: ['super_admin', 'org_admin', 'head_of_year', 'tutor'] },
    { href: '/portal/staff/analytics', label: 'Analytics', icon: '📊', roles: ['super_admin', 'org_admin', 'head_of_year', 'tutor'] },
    { href: '/portal/staff/activities', label: 'Activities', icon: '🎯', roles: ['super_admin', 'org_admin', 'head_of_year', 'tutor'] },
    { href: '/portal/staff/students', label: 'Students', icon: '👥', roles: ['super_admin', 'org_admin', 'head_of_year', 'tutor'] },
    { href: '/portal/staff/settings', label: 'Settings', icon: '⚙️', roles: ['super_admin', 'org_admin'] },
  ]

  const visibleNavItems = navItems.filter(item => 
    item.roles.includes(profile.primary_role)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                SPARK
              </div>
              <div className="hidden sm:block text-sm text-gray-500 border-l pl-4">
                Staff Portal
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {visibleNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile.primary_role.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 px-4 py-2 overflow-x-auto">
          <div className="flex space-x-2">
            {visibleNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  pathname === item.href
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

