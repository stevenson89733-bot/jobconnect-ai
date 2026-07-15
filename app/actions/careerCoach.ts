'use server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { generateCareerAnalysis, CareerCoachError, type CareerAnalysis } from '@/lib/ai/careerCoach'

export type CareerAnalysisResult =
  | { ok: true; analysis: CareerAnalysis; generatedAt: string }
  | { ok: false; error: string }

// Expensive GPT-4o call — keyed by user id (not IP) since this always runs
// behind auth. 3 refreshes per hour is generous for a real user clicking
// "Refresh Analysis" but blocks a scripted hammer on the button.
export async function refreshCareerAnalysis(): Promise<CareerAnalysisResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const { ok: withinLimit } = rateLimit(`career-coach:${user.id}`, 3, 60 * 60 * 1000)
  if (!withinLimit) return { ok: false, error: 'Too many refreshes. Please try again in a bit.' }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('is_premium, title, bio, experience, skills, education, location, years_experience, work_preference')
    .eq('user_id', user.id)
    .single()

  if (!profileRow?.is_premium) {
    return { ok: false, error: 'AI Career Coach is a Premium feature. Upgrade to generate your analysis.' }
  }

  const skills = (profileRow.skills ?? '').trim()
  if (!skills) {
    return { ok: false, error: 'Add some skills to your profile first — there\'s not enough to analyze yet.' }
  }

  let analysis: CareerAnalysis
  try {
    analysis = await generateCareerAnalysis({
      title: profileRow.title,
      bio: profileRow.bio,
      experience: profileRow.experience,
      skills,
      education: profileRow.education,
      location: profileRow.location,
      yearsExperience: profileRow.years_experience,
      workPreference: profileRow.work_preference,
    })
  } catch (err) {
    const message = err instanceof CareerCoachError ? err.message : 'Something went wrong generating your analysis.'
    return { ok: false, error: message }
  }

  const generatedAt = new Date().toISOString()
  // Plain insert, not upsert — career_analysis no longer has a
  // unique(candidate_id) constraint, so every "Refresh Analysis" click adds
  // a new row instead of overwriting the last one. This is what lets Career
  // Progress plot real history instead of a single overwritten point.
  const { error: insertError } = await supabase
    .from('career_analysis')
    .insert({ candidate_id: user.id, analysis_json: analysis, generated_at: generatedAt })

  if (insertError) {
    // The analysis was generated successfully — still return it even if
    // caching failed, rather than throwing the result away.
    console.error('[career-coach] failed to cache analysis:', insertError.message)
  }

  return { ok: true, analysis, generatedAt }
}
