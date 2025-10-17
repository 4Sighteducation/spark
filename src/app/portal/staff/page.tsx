'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StaffHomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to coaching page by default
    router.push('/portal/staff/coaching')
  }, [router])

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔄</div>
      <p className="text-gray-600">Redirecting...</p>
    </div>
  )
}

