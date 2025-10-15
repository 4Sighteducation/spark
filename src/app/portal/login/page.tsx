'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/portal/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Debug: Check if Supabase is configured
  useEffect(() => {
    console.log('🔍 Checking Supabase configuration...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase client:', !!supabase)
    console.log('Window location:', window.location.href)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('STEP 1: Form submitted')
    
    setError('')
    setLoading(true)
    console.log('STEP 2: Loading state set to true')

    console.log('STEP 3: Calling Supabase login for:', email)

    try {
      console.log('STEP 4: Inside try block, about to call signInWithPassword')
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('STEP 5: Got response from Supabase')
      console.log('Response data:', data)
      console.log('Response error:', signInError)

      if (signInError) {
        console.error('STEP 6A: Login error detected:', signInError)
        setError(signInError.message)
        setLoading(false)
        return
      }

      console.log('STEP 6B: No error, checking session...')
      console.log('Session exists?', !!data.session)
      console.log('Session data:', data.session)

      if (data.session) {
        console.log('STEP 7: Session confirmed! Preparing redirect...')
        console.log('Redirect target:', redirectTo)
        console.log('STEP 8: About to set window.location.href')
        
        // Successful login - use window.location for full page reload
        setTimeout(() => {
          console.log('STEP 9: Executing redirect NOW')
          window.location.href = redirectTo
        }, 100)
      } else {
        console.error('STEP 7 ERROR: No session in response')
        setError('Login failed - no session created')
        setLoading(false)
      }
    } catch (err) {
      console.error('STEP ERROR: Exception caught:', err)
      console.error('Error details:', err)
      setError('An unexpected error occurred: ' + (err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-cyan-50 px-4">
      {/* Mobile-first responsive container */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <Image
              src="/spark-logo.png"
              alt="SPARK"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              SPARK Portal
            </h1>
            <p className="text-gray-600 mt-2">Student Assessment & Growth Platform</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                placeholder="you@school.com"
                autoComplete="email"
              />
            </div>

            {/* Password Input with Toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {/* View Password Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-2"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    // Eye slash icon (hide)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    // Eye icon (show)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base touch-manipulation min-h-[44px]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Password Reset Link */}
            <div className="text-center">
              <Link
                href="/portal/reset-password"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          {/* Test Credentials (Dev Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">Test Accounts:</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Student (High):</strong> stutest1@vespa.academy
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Student (Med):</strong> stutest2@vespa.academy
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Student (Low):</strong> stutest3@vespa.academy
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Password:</strong> TestPass123!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to Marketing Site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to SPARK Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

