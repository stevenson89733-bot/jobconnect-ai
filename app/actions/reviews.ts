'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { candidateHasApplicationAt, MAX_REVIEW_TEXT_LENGTH } from '@/lib/reviews'

export type SubmitReviewResult = { ok: true } | { ok: false; error: string }

// Real DB-level eligibility is enforced by the RLS insert policy in
// supabase/reviews.sql (candidates can submit eligible reviews) — this
// check here is belt-and-suspenders so we can show a real, specific error
// message instead of a raw RLS-violation error from Postgres.
export async function submitCompanyReview(input: {
  companyName: string
  rating: number
  reviewText: string
}): Promise<SubmitReviewResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  const companyName = input.companyName.trim()
  const reviewText = input.reviewText.trim()
  const rating = Math.round(input.rating)

  if (!companyName) return { ok: false, error: 'Missing company.' }
  if (!reviewText) return { ok: false, error: 'Review text cannot be empty.' }
  if (reviewText.length > MAX_REVIEW_TEXT_LENGTH) {
    return { ok: false, error: 'Review is too long.' }
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: 'Rating must be between 1 and 5.' }
  }

  const eligible = await candidateHasApplicationAt(supabase, user.id, companyName)
  if (!eligible) {
    return { ok: false, error: 'You can only review a company you have applied to.' }
  }

  const { error } = await supabase.from('company_reviews').insert({
    candidate_id: user.id,
    company_name: companyName,
    rating,
    review_text: reviewText,
  })

  if (error) {
    // Unique violation → they already have a review for this company
    // (race with a second tab, etc.) — the UI's normal path already
    // prevents this by checking for an existing review first.
    if (error.code === '23505') {
      return { ok: false, error: 'You have already submitted a review for this company.' }
    }
    console.error('[reviews/submit]', error.message)
    return { ok: false, error: 'Could not submit your review — please try again.' }
  }

  revalidatePath(`/companies/${encodeURIComponent(companyName)}`)
  return { ok: true }
}

export type ModerateReviewResult = { ok: true } | { ok: false; error: string }

export async function moderateCompanyReview(
  reviewId: string,
  decision: 'approved' | 'rejected'
): Promise<ModerateReviewResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'You must be signed in.' }

  // Belt-and-suspenders — the RLS update policy already restricts this to
  // admins (public.is_admin(auth.uid())), so a non-admin's update simply
  // affects zero rows regardless of this check.
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single()
  if (!profile?.is_admin) return { ok: false, error: 'Admins only.' }

  const { data, error } = await supabase
    .from('company_reviews')
    .update({ status: decision, moderated_at: new Date().toISOString(), moderated_by: user.id })
    .eq('id', reviewId)
    .select('company_name')
    .single()

  if (error) {
    console.error('[reviews/moderate]', error.message)
    return { ok: false, error: 'Could not update this review.' }
  }

  revalidatePath('/admin/reviews')
  if (data?.company_name) revalidatePath(`/companies/${encodeURIComponent(data.company_name)}`)
  return { ok: true }
}
