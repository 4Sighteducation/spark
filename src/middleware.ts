import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Portal routes require authentication
  if (req.nextUrl.pathname.startsWith('/portal')) {
    if (!session && !req.nextUrl.pathname.startsWith('/portal/login')) {
      // Redirect to login if not authenticated
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/portal/login'
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If authenticated and trying to access login, redirect to dashboard
    if (session && req.nextUrl.pathname === '/portal/login') {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/portal/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    '/portal/:path*',
  ],
}

