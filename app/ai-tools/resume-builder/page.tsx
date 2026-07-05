import { createClient } from '@/lib/supabase/server'
import ResumeBuilderClient from './ResumeBuilderClient'

export const dynamic = 'force-dynamic'

export default async function ResumeBuilderPage() {
  let isPremium = false
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('user_id', user.id)
        .single()
      isPremium = data?.is_premium ?? false
    }
  } catch {}

  return <ResumeBuilderClient isPremium={isPremium} />
}
