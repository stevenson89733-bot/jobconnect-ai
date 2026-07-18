'use server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit } from '@/lib/rateLimit'
import { generateResumeAnalysis, ResumeAnalysisError, type ResumeAnalysis, type ResumeDocumentInput } from '@/lib/ai/resumeAnalysis'

export type ResumeAnalysisResult =
  | { ok: true; analysis: ResumeAnalysis }
  | { ok: false; error: string }

// Expensive GPT-4o call — keyed by user id, same pattern as Career Coach.
// A resume gets iterated on more than a career analysis, so the limit is a
// bit more generous (5/hour vs 3/hour) while still blocking a button-mash.
export async function analyzeResume(doc: ResumeDocumentInput): Promise<ResumeAnalysisResult> {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: t('mustBeSignedIn') }

  const { ok: withinLimit } = rateLimit(`resume-analysis:${user.id}`, 5, 60 * 60 * 1000)
  if (!withinLimit) return { ok: false, error: t('tooManyAnalyses') }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('user_id', user.id)
    .single()

  if (!profileRow?.is_premium) {
    return { ok: false, error: t('resumeAnalysisPremiumOnly') }
  }

  const hasContent = !!(doc.summary?.trim() || doc.experience?.trim())
  if (!hasContent) {
    return { ok: false, error: t('generateResumeFirstAnalyze') }
  }

  try {
    const analysis = await generateResumeAnalysis(doc)
    return { ok: true, analysis }
  } catch (err) {
    // ResumeAnalysisError wraps a dynamic underlying AI-provider/config
    // error — left untranslated, same as other third-party passthroughs.
    const message = err instanceof ResumeAnalysisError ? err.message : t('somethingWentWrongAnalyzingResume')
    return { ok: false, error: message }
  }
}
