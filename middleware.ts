import { NextResponse, type NextRequest } from 'next/server'

/**
 * Lightweight Edge-compatible middleware for route protection.
 * Checks for the Supabase session cookie without importing the
 * Supabase SDK (which uses Node.js APIs incompatible with Edge runtime).
 * Full token validation happens in each server component via lib/supabase/server.ts.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Derive the cookie name from the project ref in the Supabase URL
  // e.g. https://fqlrhybynsdlbtamitay.supabase.co → sb-fqlrhybynsdlbtamitay-auth-token
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

  // If Supabase isn't configured yet, allow all requests through
  if (!projectRef) return NextResponse.next()

  const cookieName = `sb-${projectRef}-auth-token`
  const hasSession = request.cookies.has(cookieName)

  if (!hasSession) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/candidate/:path*', '/recruiter/:path*', '/dashboard/:path*'],
}
