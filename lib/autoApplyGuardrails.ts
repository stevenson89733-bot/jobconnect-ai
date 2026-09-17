// Daily application limits per candidate plan.
// Free users have auto-apply disabled (0). Pro: 3/day. Elite: 5/day.
export const DAILY_LIMIT: Record<string, number> = {
  free: 0,
  pro: 3,
  elite: 5,
}

export const MATCH_THRESHOLD = 75

export type GuardrailResult =
  | { allowed: true }
  | { allowed: false; reason: 'blocked_low_match' | 'blocked_not_international' | 'blocked_daily_limit' }

export function checkMatchThreshold(matchScore: number | null | undefined): GuardrailResult {
  if ((matchScore ?? 0) < MATCH_THRESHOLD) {
    return { allowed: false, reason: 'blocked_low_match' }
  }
  return { allowed: true }
}

export function checkCrossBorder(crossBorderStatus: string | null | undefined): GuardrailResult {
  // Allow 'yes' and null (unclassified) — only block explicit 'no'
  if (crossBorderStatus === 'no') {
    return { allowed: false, reason: 'blocked_not_international' }
  }
  return { allowed: true }
}

export function checkDailyLimit(candidatePlan: string | null | undefined, sentToday: number): GuardrailResult {
  const plan = candidatePlan ?? 'free'
  const limit = DAILY_LIMIT[plan] ?? 0
  if (sentToday >= limit) {
    return { allowed: false, reason: 'blocked_daily_limit' }
  }
  return { allowed: true }
}
