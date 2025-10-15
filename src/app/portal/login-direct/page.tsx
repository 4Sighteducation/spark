'use client'

import { supabase } from '@/lib/supabase/client'

export default function DirectLoginTest() {
  const testLogin = async () => {
    console.log('🚀 DIRECT LOGIN TEST STARTING')
    
    const email = 'stutest1@vespa.academy'
    const password = 'TestPass123!'
    
    console.log('Credentials:', { email, password })
    
    try {
      console.log('Calling signInWithPassword...')
      
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('✅ Got result:', result)
      console.log('Session:', result.data.session)
      console.log('Error:', result.error)
      
      if (result.data.session) {
        alert('LOGIN SUCCESS! Session created. Redirecting...')
        window.location.href = '/portal/dashboard-simple'
      } else if (result.error) {
        alert('LOGIN FAILED: ' + result.error.message)
      }
    } catch (err) {
      console.error('EXCEPTION:', err)
      alert('EXCEPTION: ' + err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">🧪 Direct Login Test</h1>
        
        <p className="text-gray-600 mb-4">
          This will attempt to login as:<br />
          <strong>stutest1@vespa.academy</strong>
        </p>
        
        <button
          onClick={testLogin}
          className="w-full bg-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-purple-700 text-lg"
        >
          🔐 TEST LOGIN NOW
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          Check browser console for detailed logs
        </p>
      </div>
    </div>
  )
}

