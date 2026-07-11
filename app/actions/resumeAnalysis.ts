'use server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { generateResumeAnalysis, ResumeAnalysisError, type ResumeAnalysis, type ResumeDocumentInput } from '@/lib/ai/resumeAnalysis'

export type ResumeAnalysisResult =
  | { ok: true; analysis: ResumeAnalysis }
  | { ok: false; error: string }

// Expensive GPT-4o call — keyed by user id, same pattern as Career Coach.
// A resume gets iterated on more than a career analysis, so the limit is a
// bit more generous (5/hour vs 3/hour) while still blocking a button-mash.
export async function analyzeResume(doc: ResumeDocumentInput): Promise<ResumeAnalysisResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { ok: withinLimit } = rateLimit(`resume-analysis:${user.id}`, 5, 60 * 60 * 1000)
  if (!withinLimit) return { ok: false, error: 'Too many analyses. Please try again in a bit.' }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('user_id', user.id)
    .single()

  if (!profileRow?.is_premium) {
    return { ok: false, error: 'Resume analysis is a Premium feature.' }
  }

  const hasContent = !!(doc.summary?.trim() || doc.experience?.trim())
  if (!hasContent) {
    return { ok: false, error: 'Generate a resume first — there\'s nothing to analyze yet.' }
  }

  try {
    const analysis = await generateResumeAnalysis(doc)
    return { ok: true, analysis }
  } catch (err) {
    const message = err instanceof ResumeAnalysisError ? err.message : 'Something went wrong analyzing your resume.'
    return { ok: false, error: message }
  }
}
