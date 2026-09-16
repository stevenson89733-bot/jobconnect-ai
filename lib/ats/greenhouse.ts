// Greenhouse Harvest API — submit a real job application on behalf of a candidate.
// Docs: https://developers.greenhouse.io/job-board.html#submit-an-application

export type GreenhouseApplicationInput = {
  apply_url: string       // full boards.greenhouse.io URL — board_token + job_id extracted here
  first_name: string
  last_name: string
  email: string
  phone?: string
  cv_url?: string | null  // stored signed URL from Supabase Storage
  cover_letter?: string
}

export type GreenhouseApplicationResult =
  | { success: true; greenhouse_id: string }
  | { success: false; error: string }

// Extract board_token and job_id from a URL like:
//   https://boards.greenhouse.io/gitlab/jobs/12345678
//   https://job-boards.greenhouse.io/remote/jobs/4322001007
const GH_URL_RE = /greenhouse\.io\/([^/]+)\/jobs\/(\d+)/

export async function submitGreenhouseApplication(
  input: GreenhouseApplicationInput
): Promise<GreenhouseApplicationResult> {
  const apiKey = process.env.GREENHOUSE_API_KEY
  if (!apiKey) {
    return { success: false, error: 'GREENHOUSE_API_KEY not configured' }
  }

  const match = input.apply_url.match(GH_URL_RE)
  if (!match) {
    return { success: false, error: `Cannot parse board_token/job_id from URL: ${input.apply_url}` }
  }
  const [, boardToken, jobId] = match

  const endpoint = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs/${jobId}/applications`

  // Greenhouse expects Basic auth: base64("api_key:")
  const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`

  const payload: Record<string, unknown> = {
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.cv_url ? { resume_url: input.cv_url } : {}),
    ...(input.cover_letter
      ? { cover_letter: input.cover_letter }
      : {}),
  }

  let res: Response
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    return { success: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` }
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return { success: false, error: `Greenhouse API ${res.status}: ${body}` }
  }

  const data = await res.json().catch(() => ({}))
  // Greenhouse returns the application object; id is the submission ID
  const greenhouse_id = String(data?.id ?? '')
  return { success: true, greenhouse_id }
}
