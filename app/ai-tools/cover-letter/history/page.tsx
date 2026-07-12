import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { listCoverLetterDrafts } from '@/app/actions/coverLetters'
import CoverLetterHistoryClient from './CoverLetterHistoryClient'

export const dynamic = 'force-dynamic'

export default async function CoverLetterHistoryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_premium').eq('user_id', user.id).single()
  if (!profile?.is_premium) redirect('/ai-tools/cover-letter')

  const result = await listCoverLetterDrafts()
  const drafts = result.ok ? result.drafts : []

  return <CoverLetterHistoryClient initialDrafts={drafts} loadError={result.ok ? '' : result.error} />
}
