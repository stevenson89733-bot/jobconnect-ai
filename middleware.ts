import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { LOCALE_COOKIE, detectLocaleFromAcceptLanguage } from '@/lib/i18n/config'

/**
 * Routes that require an authenticated user. If no valid session is present,
 * the request is redirected to /login (carrying the refreshed session cookies).
 */
const PROTECTED_PREFIXES = ['/dashboard', '/candidate', '/recruiter', '/admin']
const AUTH_PATHS = ['/login', '/register']

/**
 * Official @supabase/ssr middleware pattern.
 *
 * Creates its OWN server client wired to the request/response cookies (it does
 * NOT reuse lib/supabase/server.ts, whose setAll swallows writes with an empty
 * catch — fine inside Server Components, but it would drop the refreshed token
 * here). getUser() forces a session refresh; the refreshed cookies are written
 * onto supabaseResponse and, on redirect, copied onto the redirect response so
 * the new token is never lost.
 */
async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase isn't configured yet, don't block anything.
  if (!url || !key) return supabaseResponse

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Mirror onto the request (for any downstream read in this pass)…
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        // …and rebuild the response so the refreshed cookies are sent back.
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANT: do not run code between createServerClient and getUser().
  // getUser() revalidates the token and triggers the cookie refresh above.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)

    const redirectResponse = NextResponse.redirect(loginUrl)
    // Copy the refreshed session cookies onto the redirect response,
    // otherwise the token rotated by getUser() would be lost.
    supabaseResponse.cookies.getAll().forEach((cookie) =>
      redirectResponse.cookies.set(cookie)
    )
    return redirectResponse
  }

  return supabaseResponse
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const needsAuthCheck =
    PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    AUTH_PATHS.includes(pathname)

  // Only the auth-relevant paths pay for the Supabase session-refresh round
  // trip above; every other request gets a plain pass-through response that
  // the locale check below can still attach a cookie to.
  const response = needsAuthCheck ? await updateSession(request) : NextResponse.next({ request })

  // First-visit browser-language detection — only when no locale has ever
  // been chosen (manual switch or a prior visit already set this cookie).
  if (!request.cookies.get(LOCALE_COOKIE)) {
    const detected = detectLocaleFromAcceptLanguage(request.headers.get('accept-language'))
    if (detected) {
      response.cookies.set(LOCALE_COOKIE, detected, { path: '/', maxAge: 31536000 })
    }
  }

  return response
}

export const config = {
  // Runs on every page request (not just auth-relevant paths) so first-visit
  // locale detection works site-wide; static assets/Next internals excluded.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
