export async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  // If not configured, skip verification (graceful degradation during rollout)
  if (!secret) return true
  if (!token) return false

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
    })
    const data = await res.json() as { success: boolean }
    return data.success === true
  } catch {
    // Network failure — fail open to avoid blocking real users
    return true
  }
}
