// Lever public job board API — no API key required for candidate-facing apply.
// Docs: https://hire.lever.co/developer/postings#apply-to-a-posting

// URL pattern: https://jobs.lever.co/{company}/{jobId}
const LEVER_URL_RE = /jobs\.lever\.co\/[^/]+\/([a-f0-9-]{36})/i

export function detectLeverUrl(applyUrl: string): boolean {
  return applyUrl.includes('jobs.lever.co')
}

export type LeverCandidate = {
  name: string
  email: string
  phone?: string
  cvUrl?: string | null
  coverLetter?: string
}

export type LeverApplicationResult =
  | { success: true }
  | { success: false; error: string }

export async function submitLeverApplication(
  jobUrl: string,
  candidate: LeverCandidate
): Promise<LeverApplicationResult> {
  const match = jobUrl.match(LEVER_URL_RE)
  if (!match) {
    return { success: false, error: `Cannot parse jobId from Lever URL: ${jobUrl}` }
  }

  // Extract company slug from URL for the endpoint
  const urlParts = jobUrl.replace(/^https?:\/\//, '').split('/')
  // jobs.lever.co / {company} / {jobId}
  const company = urlParts[1]
  const jobId = match[1]

  if (!company || !jobId) {
    return { success: false, error: `Missing company or jobId in URL: ${jobUrl}` }
  }

  const endpoint = `https://api.lever.co/v0/postings/${company}/${jobId}/apply`

  // Lever public apply uses application/json
  const payload: Record<string, string> = {
    name: candidate.name,
    email: candidate.email,
  }
  if (candidate.phone) payload.phone = candidate.phone
  if (candidate.cvUrl) payload.resume = candidate.cvUrl
  if (candidate.coverLetter) payload.comments = candidate.coverLetter

  let res: Response
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    return { success: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` }
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return { success: false, error: `Lever API ${res.status}: ${body}` }
  }

  return { success: true }
}
