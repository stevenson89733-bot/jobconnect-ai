'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

// ── Step 6: Save user to Supabase on signup with role ─────────────────────────
export async function signUp(formData: FormData) {
  const { ok } = rateLimit(`signup:${getClientIp()}`, 5, 10 * 60 * 1000)
  if (!ok) redirect(`/register?error=${encodeURIComponent('Too many signup attempts. Please try again in a few minutes.')}`)

  const supabase = createClient()

  const email       = formData.get('email')       as string
  const password    = formData.get('password')    as string
  const firstName   = formData.get('firstName')   as string
  const lastName    = formData.get('lastName')    as string
  const role        = formData.get('role')        as 'candidate' | 'employer'
  const companyName = formData.get('companyName') as string | null

  // Create the auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, role },
    },
  })

  if (error || !data.user) {
    redirect(`/register?error=${encodeURIComponent(error?.message ?? 'Signup failed')}`)
  }

  // Insert into profiles table (user_id = auth user id)
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id:      data.user!.id,
    email,
    full_name:    `${firstName} ${lastName}`.trim(),
    role,
    company_name: role === 'employer' ? (companyName || null) : null,
  })

  if (profileError) {
    // Profile insert failed — still redirect, trigger will retry
    console.error('Profile insert error:', profileError.message)
  }

  // Step 8: redirect by role
  redirect(role === 'employer' ? '/recruiter' : '/candidate')
}

// ── Step 7: Authenticate via Supabase, Step 8: redirect by role ───────────────
export async function signIn(formData: FormData) {
  const { ok } = rateLimit(`signin:${getClientIp()}`, 8, 5 * 60 * 1000)
  if (!ok) redirect(`/login?error=${encodeURIComponent('Too many sign-in attempts. Please try again in a few minutes.')}`)

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
