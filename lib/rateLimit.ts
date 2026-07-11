import { headers } from 'next/headers'

/**
 * In-memory sliding-window rate limiter, keyed per Node process.
 *
 * Scope/limitation: on Vercel, serverless functions can run on different
 * instances between requests, so this is NOT a hard cross-instance
 * guarantee — a determined attacker distributing requests across cold
 * starts could see a higher effective limit. It's a cheap first line of
 * defense against simple scripted loops hitting a warm instance, with zero
 * new infrastructure (no Redis/Upstash signup required). Supabase Auth
 * itself also enforces its own built-in, project-level rate limits on
 * signInWithPassword/signUp as a backstop this can't bypass.
 */
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

// Opportunistic cleanup so the map doesn't grow unbounded over the life of a warm instance.
function sweepExpired(now: number) {
  if (buckets.size < 500) return
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key)
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSeconds?: number } {
  const now = Date.now()
  sweepExpired(now)

  const bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count++
  return { ok: true }
}

// Best-effort caller IP from the standard proxy header Vercel sets.
export function getClientIp(): string {
  const forwardedFor = headers().get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || 'unknown'
}
