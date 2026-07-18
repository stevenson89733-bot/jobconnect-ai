'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

// ── Step 6: Save user to Supabase on signup with role ─────────────────────────
export async function signUp(formData: FormData) {
  const t = await getTranslations('errors')
  const { ok } = rateLimit(`signup:${getClientIp()}`, 5, 10 * 60 * 1000)
  if (!ok) redirect(`/register?error=${encodeURIComponent(t('tooManySignupAttempts'))}`)

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

  if (error || !data.user) {
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

  if (profileError) {
    console.error('Profile upsert error:', profileError.message)
  }

  // Step 8: redirect by role
  redirect(role === 'employer' ? '/recruiter' : '/candidate')
}

// ── Step 7: Authenticate via Supabase, Step 8: redirect by role ───────────────
export async function signIn(formData: FormData) {
  const t = await getTranslations('errors')
  const { ok } = rateLimit(`signin:${getClientIp()}`, 8, 5 * 60 * 1000)
  if (!ok) redirect(`/login?error=${encodeURIComponent(t('tooManySigninAttempts'))}`)

  const supabase = createClient()

  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Look up the profile to get role
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    redirect(profile?.role === 'employer' ? '/recruiter' : '/candidate')
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
