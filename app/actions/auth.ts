'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

// ── Step 6: Save user to Supabase on signup with role ─────────────────────────
export async function signUp(formData: FormData) {
  // Real wall-clock timing per step — temporary instrumentation to
  // re-diagnose reported 30s-1min signups (10-25x the ~2.2s previously
  // measured for auth.signUp() alone). Logged via console so it shows up
  // in real Vercel function logs, not estimated.
  const t0 = Date.now()
  const t = await getTranslations('errors')
  const { ok } = rateLimit(`signup:${getClientIp()}`, 5, 10 * 60 * 1000)
  if (!ok) redirect(`/register?error=${encodeURIComponent(t('tooManySignupAttempts'))}`)
  const tRateLimit = Date.now()

  const supabase = createClient()

  const email       = formData.get('email')       as string
  const password    = formData.get('password')    as string
  const firstName   = formData.get('firstName')   as string
  const lastName    = formData.get('lastName')    as string
  const role        = formData.get('role')        as 'candidate' | 'employer'
  const companyName = formData.get('companyName') as string | null

  // Create the auth user. This call is the real bottleneck in the signup
  // flow (measured ~2.2s in production vs. ~150ms for the profile write
  // below) because Supabase Auth dispatches the confirmation email
  // synchronously as part of this same API call — not something app code
  // can shorten without changing the project's email-confirmation setting.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, role },
    },
  })
  const tSignUp = Date.now()

  if (error || !data.user) {
    console.log(`[signup timing] role=${role} rateLimit=${tRateLimit - t0}ms signUp=${tSignUp - tRateLimit}ms FAILED total=${tSignUp - t0}ms error=${error?.message}`)
    redirect(`/register?error=${encodeURIComponent(error?.message ?? t('signupFailed'))}`)
  }

  // handle_new_user() (supabase/schema.sql) already inserts a baseline
  // profiles row synchronously as part of the auth.users insert above, so by
  // the time we get here the row already exists — a plain .insert() always
  // loses that race and fails with a duplicate-key error (previously
  // silently swallowed below), which meant role/company_name from this form
  // were never actually persisted. upsert() merges onto that existing row
  // instead of erroring, so this is now the only thing that actually saves
  // the real company_name for employers.
  const { error: profileError } = await supabase.from('profiles').upsert({
    user_id:      data.user!.id,
    email,
    full_name:    `${firstName} ${lastName}`.trim(),
    role,
    company_name: role === 'employer' ? (companyName || null) : null,
  }, { onConflict: 'user_id' })
  const tProfile = Date.now()

  if (profileError) {
    console.error('Profile upsert error:', profileError.message)
  }

  console.log(
    `[signup timing] role=${role} rateLimit=${tRateLimit - t0}ms signUp=${tSignUp - tRateLimit}ms profileUpsert=${tProfile - tSignUp}ms total=${tProfile - t0}ms`
  )

  // Step 8: redirect by role
  redirect(role === 'employer' ? '/recruiter' : '/candidate')
}

// ── Step 7: Authenticate via Supabase, Step 8: redirect by role ───────────────
export async function signIn(formData: FormData) {
  const t0 = Date.now()
  const t = await getTranslations('errors')
  const { ok } = rateLimit(`signin:${getClientIp()}`, 8, 5 * 60 * 1000)
  if (!ok) redirect(`/login?error=${encodeURIComponent(t('tooManySigninAttempts'))}`)
  const tRateLimit = Date.now()

  const supabase = createClient()

  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  const tSignIn = Date.now()

  if (error) {
    console.log(`[signin timing] rateLimit=${tRateLimit - t0}ms signIn=${tSignIn - tRateLimit}ms FAILED total=${tSignIn - t0}ms error=${error.message}`)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Look up the profile to get role
  const { data: { user } } = await supabase.auth.getUser()
  const tGetUser = Date.now()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    const tProfile = Date.now()

    console.log(
      `[signin timing] rateLimit=${tRateLimit - t0}ms signIn=${tSignIn - tRateLimit}ms getUser=${tGetUser - tSignIn}ms profileSelect=${tProfile - tGetUser}ms total=${tProfile - t0}ms`
    )

    redirect(profile?.role === 'employer' ? '/recruiter' : '/candidate')
  }

  console.log(`[signin timing] rateLimit=${tRateLimit - t0}ms signIn=${tSignIn - tRateLimit}ms getUser=${tGetUser - tSignIn}ms total=${tGetUser - t0}ms (no user)`)
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
