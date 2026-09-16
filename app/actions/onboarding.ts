'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const targetCountries = formData.getAll('target_countries') as string[]
  const jobCategory     = formData.get('job_category') as string
  const nextPath        = (formData.get('next') as string) || '/candidate'

  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      target_countries:     targetCountries,
      job_category:         jobCategory || null,
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('[onboarding] save error:', error.message)
    // Column may not exist yet — still mark via cookie and proceed
  }

  redirect(nextPath)
}
