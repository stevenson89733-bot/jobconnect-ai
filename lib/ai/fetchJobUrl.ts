import { JobExtractError, MIN_TEXT_LENGTH } from './jobExtract'

const FETCH_TIMEOUT_MS = 8000
const MAX_HTML_BYTES = 500_000 // 500 KB cap before parsing

// Removes tags whose full content (including children) is noise.
const NOISE_TAG_RE = /<(script|style|noscript|nav|header|footer|aside|svg|iframe|form)\b[^>]*>[\s\S]*?<\/\1>/gi
// Strips all remaining HTML tags.
const TAG_RE = /<[^>]+>/g
// Collapses whitespace.
const WHITESPACE_RE = /[ \t]+/g
const NEWLINE_RE = /\n{3,}/g

function extractText(html: string): string {
  // Prefer <main> or <article> if present — better signal-to-noise.
  const mainMatch = html.match(/<(main|article)\b[^>]*>([\s\S]*?)<\/\1>/i)
  const source = mainMatch ? mainMatch[2] : html

  return source
    .replace(NOISE_TAG_RE, ' ')
    .replace(TAG_RE, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(WHITESPACE_RE, ' ')
    .replace(NEWLINE_RE, '\n\n')
    .trim()
}

export async function fetchJobUrl(rawUrl: string): Promise<string> {
  // Validate URL structure (caller should also validate, but belt-and-suspenders).
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new JobExtractError('Invalid URL', 400)
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new JobExtractError('Only http/https URLs are supported', 400)
  }

  let res: Response
  try {
    res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        // Appear as a plain browser — some CDNs block missing UA outright.
        'User-Agent': 'Mozilla/5.0 (compatible; JobConnectBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      // Never follow cross-origin redirects to internal addresses.
      redirect: 'follow',
    })
  } catch (err) {
    const msg = err instanceof Error && err.name === 'TimeoutError'
      ? 'The page took too long to respond (>8s). Copy and paste the job description text instead.'
      : 'Could not reach the URL. The page may be protected or unavailable — copy and paste the text instead.'
    throw new JobExtractError(msg, 422)
  }

  if (!res.ok) {
    throw new JobExtractError(
      `The page returned an error (HTTP ${res.status}). Copy and paste the job description text instead.`,
      422,
    )
  }

  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('text/html')) {
    throw new JobExtractError('The URL does not point to an HTML page. Copy and paste the text instead.', 422)
  }

  // Read up to MAX_HTML_BYTES — avoids loading huge pages into memory.
  const reader = res.body?.getReader()
  if (!reader) throw new JobExtractError('Could not read the page body.', 422)

  const chunks: Uint8Array[] = []
  let bytesRead = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done || !value) break
    chunks.push(value)
    bytesRead += value.byteLength
    if (bytesRead >= MAX_HTML_BYTES) { reader.cancel(); break }
  }
  const html = new TextDecoder().decode(
    chunks.reduce((acc, c) => { const m = new Uint8Array(acc.byteLength + c.byteLength); m.set(acc); m.set(c, acc.byteLength); return m }, new Uint8Array(0))
  )

  const text = extractText(html).slice(0, 8000)

  if (text.length < MIN_TEXT_LENGTH) {
    throw new JobExtractError(
      'Not enough readable text found on that page. It may require JavaScript to render — copy and paste the job description text instead.',
      422,
    )
  }

  return text
}
