import { createClient } from '@/lib/supabase/server'
import CoverLetterClient from './CoverLetterClient'

export const dynamic = 'force-dynamic'

export default async function CoverLetterPage() {
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

  return <CoverLetterClient isPremium={isPremium} />
}
