import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  // Only run middleware on portal routes
  if (!req.nextUrl.pathname.startsWith('/portal')) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Allow access to login, reset-password, update-password without auth
  const publicPortalRoutes = ['/portal/login', '/portal/reset-password', '/portal/update-password', '/portal/test-connection']
  const isPublicRoute = publicPortalRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (!session && !isPublicRoute) {
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

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

