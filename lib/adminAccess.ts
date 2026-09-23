/**
 * Admin accounts bypass all plan gates.
 * is_admin === true  →  treated as candidate elite + employer pro + unlimited posting.
 */

export function effectiveCandidatePlan(profile: {
  is_admin?: boolean | null
  is_premium?: boolean | null
  candidate_plan?: string | null
}): string {
  if (profile.is_admin) return 'elite'
  if (profile.candidate_plan && profile.candidate_plan !== 'free') return profile.candidate_plan
  // Legacy: is_premium=true without an explicit plan → treat as pro
  if (profile.is_premium) return 'pro'
  return profile.candidate_plan ?? 'free'
}

export function effectiveIsPremium(profile: {
  is_admin?: boolean | null
  is_premium?: boolean | null
}): boolean {
  return profile.is_admin === true || profile.is_premium === true
}

export function effectiveEmployerPlan(profile: {
  is_admin?: boolean | null
  employer_plan?: string | null
}): string {
  if (profile.is_admin) return 'pro'
  return profile.employer_plan ?? 'free'
}

export function effectiveIsUnlimitedPosting(profile: {
  is_admin?: boolean | null
  is_unlimited_posting?: boolean | null
}): boolean {
  return profile.is_admin === true || profile.is_unlimited_posting === true
}
