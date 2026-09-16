import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingModal from '@/components/OnboardingModal'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // If already completed, skip to dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role === 'employer') redirect('/recruiter')

  // Check onboarding_completed separately — column may not exist yet if
  // the migration hasn't run; the error is caught and we show the modal anyway.
  try {
    const { data: ob } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()
    if (ob?.onboarding_completed) redirect('/candidate')
  } catch {
    // Column not yet added — proceed to show onboarding
  }

  return (
    // Full-screen backdrop with a subtle brand pattern
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#10152A' }}>
      {/* Decorative glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(87,199,227,0.15) 0%, transparent 70%)' }}
      />

      {/* Brand mark */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
        <div className="inline-flex items-center gap-2 font-bold text-lg text-white">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
                style={{ background: '#57C7E3' }}>J</span>
          <span>JobConnect <span style={{ color: '#57C7E3' }}>AI</span></span>
        </div>
      </div>

      <OnboardingModal defaultNext="/candidate" />
    </div>
  )
}
