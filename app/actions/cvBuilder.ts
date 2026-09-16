'use server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import {
  generateCvImprovement,
  generateCvContent,
  CvBuilderError,
  type CvImprovementResult,
  type CvGenerateInput,
  type CvGenerateResult,
} from '@/lib/ai/cvBuilder'

// ── Mode 1: Improve ──────────────────────────────────────────────────────────

export type CvImproveResult =
  | { ok: true; result: CvImprovementResult }
  | { ok: false; error: string }

export async function improveCv(cvText: string): Promise<CvImproveResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('user_id', user.id)
    .single()

  if (!profile?.is_premium) {
    return { ok: false, error: 'CV Builder is a Premium feature. Upgrade to access it.' }
  }

  if (!cvText?.trim() || cvText.trim().length < 50) {
    return { ok: false, error: 'CV text is too short to analyze. Please upload a fuller CV.' }
  }

  const { ok: withinLimit } = rateLimit(`cv-improve:${user.id}`, 5, 60 * 60 * 1000)
  if (!withinLimit) return { ok: false, error: 'Too many requests. Please wait an hour before trying again.' }

  try {
    const result = await generateCvImprovement(cvText)
    return { ok: true, result }
  } catch (err) {
    const message = err instanceof CvBuilderError ? err.message : 'Failed to analyze CV. Please try again.'
    return { ok: false, error: message }
  }
}

// ── Mode 2: Generate ─────────────────────────────────────────────────────────

export type CvGenerateActionResult =
  | { ok: true; result: CvGenerateResult }
  | { ok: false; error: string }

export async function generateCv(input: CvGenerateInput): Promise<CvGenerateActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('user_id', user.id)
    .single()

  if (!profile?.is_premium) {
    return { ok: false, error: 'CV Builder is a Premium feature. Upgrade to access it.' }
  }

  if (!input.fullName?.trim() && !input.title?.trim() && !input.skills?.trim()) {
    return { ok: false, error: 'Your profile is empty. Complete your profile first before generating a CV.' }
  }

  const { ok: withinLimit } = rateLimit(`cv-generate:${user.id}`, 5, 60 * 60 * 1000)
  if (!withinLimit) return { ok: false, error: 'Too many requests. Please wait an hour before trying again.' }

  try {
    const result = await generateCvContent(input)
    return { ok: true, result }
  } catch (err) {
    const message = err instanceof CvBuilderError ? err.message : 'Failed to generate CV. Please try again.'
    return { ok: false, error: message }
  }
}
