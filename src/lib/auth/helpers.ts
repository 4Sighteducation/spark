import { createClient } from '@/lib/supabase/server'

/**
 * Get the current authenticated user's profile
 */
export async function getCurrentUserProfile() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

/**
 * Get the current user's student record (if they're a student)
 */
export async function getCurrentStudentRecord() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', user.id)
    .single()

  return student
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string | string[]) {
  const profile = await getCurrentUserProfile()
  if (!profile) return false

  const roles = Array.isArray(role) ? role : [role]
  
  // Check primary role
  if (roles.includes(profile.primary_role)) return true

  // Check additional roles in user_roles table
  const supabase = createClient()
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', profile.id)
    .eq('is_active', true)

  if (!userRoles) return false

  return userRoles.some(ur => roles.includes(ur.role))
}

/**
 * Check if user is a student
 */
export async function isStudent() {
  const profile = await getCurrentUserProfile()
  return profile?.primary_role === 'student'
}

/**
 * Check if user is staff
 */
export async function isStaff() {
  return hasRole(['org_admin', 'head_of_year', 'teacher', 'tutor', 'head_of_department'])
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  return hasRole(['super_admin', 'org_admin'])
}

