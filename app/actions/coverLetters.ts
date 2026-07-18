'use server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import type { CoverLetterDraft, CoverLetterStyleValue, SavedLetterContent } from '@/lib/coverLetters'

const VALID_STYLES: CoverLetterStyleValue[] = ['Formal', 'Conversational', 'Concise']
const MAX_JOB_DESCRIPTION_LENGTH = 6000

export type SaveDraftInput = {
  companyName: string
  targetRole: string
  jobDescription?: string
  style: string
  letterContent: SavedLetterContent
}

export type SaveDraftResult = { ok: true; id: string } | { ok: false; error: string }

// No LLM call here — just a DB write behind auth, so no rate limit (same
// reasoning as skipping it on other simple authenticated writes elsewhere
// in the app).
export async function saveCoverLetterDraft(input: SaveDraftInput): Promise<SaveDraftResult> {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: t('mustBeSignedIn') }

  const companyName = input.companyName.trim()
  const targetRole = input.targetRole.trim()
  if (!companyName || !targetRole) {
    return { ok: false, error: t('missingCompanyOrRole') }
  }
  if (!input.letterContent?.opening?.trim()) {
    return { ok: false, error: t('nothingToSaveYet') }
  }

  const style = VALID_STYLES.includes(input.style as CoverLetterStyleValue) ? input.style : 'Formal'

  const { data, error } = await supabase
    .from('cover_letters')
    .insert({
      candidate_id: user.id,
      company_name: companyName,
      target_role: targetRole,
      job_description: input.jobDescription?.trim().slice(0, MAX_JOB_DESCRIPTION_LENGTH) || null,
      style,
      letter_content: input.letterContent,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[cover-letters/save]', error.message)
    return { ok: false, error: t('couldNotSaveDraft') }
  }

  return { ok: true, id: data.id }
}

export type ListDraftsResult = { ok: true; drafts: CoverLetterDraft[] } | { ok: false; error: string }

export async function listCoverLetterDrafts(): Promise<ListDraftsResult> {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: t('mustBeSignedIn') }

  const { data, error } = await supabase
    .from('cover_letters')
    .select('id, company_name, target_role, job_description, style, letter_content, created_at, updated_at')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[cover-letters/list]', error.message)
    return { ok: false, error: t('couldNotLoadSavedLetters') }
  }

  return { ok: true, drafts: data as CoverLetterDraft[] }
}

export type DeleteDraftResult = { ok: true } | { ok: false; error: string }

export async function deleteCoverLetterDraft(id: string): Promise<DeleteDraftResult> {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: t('mustBeSignedIn') }

  // RLS also scopes this to the caller's own rows — the .eq() here is
  // belt-and-suspenders, not the only guard.
  const { error } = await supabase
    .from('cover_letters')
    .delete()
    .eq('id', id)
    .eq('candidate_id', user.id)

  if (error) {
    console.error('[cover-letters/delete]', error.message)
    return { ok: false, error: t('couldNotDeleteLetter') }
  }

  return { ok: true }
}
