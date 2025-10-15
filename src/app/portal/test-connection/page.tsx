'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestConnectionPage() {
  const [status, setStatus] = useState<{
    envUrl?: string
    envKey?: string
    clientExists?: boolean
    dbConnection?: string
    authWorks?: string
    currentSession?: string
  }>({})

  useEffect(() => {
    async function test() {
      const checks = {
        envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
        clientExists: !!supabase,
      }

      // Test connection
      try {
        const { data, error } = await supabase.from('organizations').select('count').single()
        checks.dbConnection = error ? `❌ ${error.message}` : '✅ Connected'
      } catch (err) {
        checks.dbConnection = `❌ ${err}`
      }

      // Test auth
      try {
        const { data, error } = await supabase.auth.getSession()
        checks.authWorks = error ? `❌ ${error.message}` : '✅ Working'
        checks.currentSession = data.session ? '✅ Logged in' : '⚠️ Not logged in'
      } catch (err) {
        checks.authWorks = `❌ ${err}`
      }

      setStatus(checks)
    }

    test()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">🔍 Supabase Connection Test</h1>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Supabase URL:</span>
            <span className="font-mono text-sm">{status.envUrl || 'Loading...'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Anon Key:</span>
            <span>{status.envKey || 'Loading...'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Client Created:</span>
            <span>{status.clientExists ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Database Connection:</span>
            <span>{status.dbConnection || 'Testing...'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Auth System:</span>
            <span>{status.authWorks || 'Testing...'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Current Session:</span>
            <span>{status.currentSession || 'Checking...'}</span>
          </div>
        </div>

        <div className="mt-6">
          <a href="/portal/login" className="text-blue-600 hover:underline">
            → Go to Login Page
          </a>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded font-mono text-xs overflow-auto">
          <pre>{JSON.stringify(status, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}

