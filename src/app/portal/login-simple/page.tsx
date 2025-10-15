'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function SimpleLogin() {
  const [message, setMessage] = useState('')

  const doLogin = async () => {
    setMessage('🔄 Starting login...')
    console.log('🔄 Starting login...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'stutest1@vespa.academy',
        password: 'TestPass123!',
      })
      
      console.log('Result:', { data, error })
      
      if (error) {
        setMessage('❌ Error: ' + error.message)
        console.error('Error:', error)
      } else if (data.session) {
        setMessage('✅ SUCCESS! Redirecting...')
        console.log('✅ SUCCESS! Session:', data.session)
        setTimeout(() => {
          window.location.href = '/portal/dashboard-simple'
        }, 1000)
      } else {
        setMessage('❌ No session returned')
      }
    } catch (err) {
      setMessage('❌ Exception: ' + err)
      console.error('Exception:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-4xl font-bold">Simple Login Test</h1>
        
        <button
          onClick={() => {
            console.log('BUTTON CLICKED!')
            doLogin()
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-lg text-2xl"
        >
          CLICK TO LOGIN
        </button>
        
        {message && (
          <div className="bg-gray-800 p-6 rounded-lg text-xl">
            {message}
          </div>
        )}
        
        <div className="bg-gray-800 p-4 rounded text-sm">
          <p>Will login as: stutest1@vespa.academy</p>
          <p>Check console for logs</p>
        </div>
      </div>
    </div>
  )
}

