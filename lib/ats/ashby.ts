// Ashby ATS integration — requires ASHBY_API_KEY (server-side only).
// Docs: https://developers.ashbyhq.com/reference/applicationformsubmit

// URL patterns:
//   jobs.ashbyhq.com/{company}/{jobId}
//   app.ashbyhq.com/jobs/{company}/{jobId}
const ASHBY_JOB_ID_RE = /ashbyhq\.com\/(?:jobs\/)?[^/]+\/([a-f0-9-]{36})/i

export function detectAshbyUrl(applyUrl: string): boolean {
  return applyUrl.includes('ashbyhq.com')
}

export type AshbyApplicationResult =
  | { success: true; applicationId?: string }
  | { success: false; error: string }

export async function submitAshbyApplication(params: {
  applyUrl: string
  candidateName: string
  candidateEmail: string
  cvUrl: string
  coverLetter?: string
}): Promise<AshbyApplicationResult> {
  const { applyUrl, candidateName, candidateEmail, cvUrl, coverLetter } = params

  const match = applyUrl.match(ASHBY_JOB_ID_RE)
  if (!match) {
    return { success: false, error: `Cannot parse jobId from Ashby URL: ${applyUrl}` }
  }
  const jobPostingId = match[1]

  const apiKey = process.env.ASHBY_API_KEY
  if (!apiKey) {
    return { success: false, error: 'ASHBY_API_KEY is not set' }
  }

  const credentials = Buffer.from(`${apiKey}:`).toString('base64')

  const applicationForm: Record<string, string> = {
    _systemfield_name: candidateName,
    _systemfield_email: candidateEmail,
    _systemfield_resume: cvUrl,
  }
  if (coverLetter) {
    applicationForm._systemfield_cover_letter = coverLetter
  }

  let res: Response
  try {
    res = await fetch('https://api.ashbyhq.com/applicationForm.submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({ jobPostingId, applicationForm }),
    })
  } catch (err) {
    return { success: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` }
  }

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const message = body?.errors?.[0]?.message ?? body?.error ?? `Ashby API ${res.status}`
    return { success: false, error: message }
  }

  return {
    success: true,
    applicationId: body?.applicationId ?? body?.results?.applicationId,
  }
}
