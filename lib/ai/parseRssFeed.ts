import { JobExtractError } from './jobExtract'

const FETCH_TIMEOUT_MS = 8000
const MAX_RSS_BYTES = 2_000_000 // 2 MB cap for the full feed

export interface RssFeedItem {
  title: string | null
  link: string | null
  description: string | null
  pubDate: string | null
  guid: string | null
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function extractCdata(text: string): string {
  const cdataMatch = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdataMatch) {
    return cdataMatch[1];
  }
  return text;
}

function extractTextFromTag(xml: string, tag: string): string | null {
  // Match opening tag, content, and closing tag
  // Handles CDATA, nested tags, and special chars
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(pattern)
  if (!match || !match[1]) return null

  const content = match[1].trim()
  if (!content) return null

  // Handle CDATA sections
  const decoded = extractCdata(content)
  // Decode XML entities FIRST so we can strip HTML tags properly
  const decodedEntities = decodeXmlEntities(decoded)
  // Strip HTML comments
  const noComments = decodedEntities.replace(/<!--[\s\S]*?-->/g, ' ')
  // Strip script and style tags entirely
  const noScripts = noComments
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  // Strip all remaining tags
  const noTags = noScripts.replace(/<[^>]+>/g, ' ')
  // Collapse whitespace and newlines
  const cleaned = noTags
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()

  return cleaned || null
}

function parseRssItems(xml: string): RssFeedItem[] {
  // Extract all <item> tags
  const itemPattern = /<item\b[^>]*>([\s\S]*?)<\/item>/gi
  const matches = Array.from(xml.matchAll(itemPattern))

  return matches.map((match) => {
    const itemXml = match[1]
    return {
      title: extractTextFromTag(itemXml, 'title'),
      link: extractTextFromTag(itemXml, 'link'),
      description: extractTextFromTag(itemXml, 'description'),
      pubDate: extractTextFromTag(itemXml, 'pubDate'),
      guid: extractTextFromTag(itemXml, 'guid'),
    }
  })
}

export async function fetchAndParseRssFeed(feedUrl: string): Promise<RssFeedItem[]> {
  // Validate URL
  let url: URL
  try {
    url = new URL(feedUrl)
  } catch {
    throw new JobExtractError('Invalid RSS feed URL', 400)
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new JobExtractError('Only http/https URLs are supported', 400)
  }

  let res: Response
  try {
    res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobConnectBot/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      redirect: 'follow',
    })
  } catch (err) {
    const msg = err instanceof Error && err.name === 'TimeoutError'
      ? 'The RSS feed took too long to respond (>8s). Please try again later.'
      : 'Could not reach the RSS feed. The service may be unavailable — please try again later.'
    throw new JobExtractError(msg, 422)
  }

  if (!res.ok) {
    throw new JobExtractError(
      `The RSS feed returned an error (HTTP ${res.status}). Please try again later.`,
      422,
    )
  }

  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('xml') && !ct.includes('rss')) {
    throw new JobExtractError('The URL does not point to a valid RSS feed.', 422)
  }

  // Read up to MAX_RSS_BYTES
  const reader = res.body?.getReader()
  if (!reader) throw new JobExtractError('Could not read the feed body.', 422)

  const chunks: Uint8Array[] = []
  let bytesRead = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done || !value) break
    chunks.push(value)
    bytesRead += value.byteLength
    if (bytesRead >= MAX_RSS_BYTES) {
      reader.cancel()
      break
    }
  }

  const xml = new TextDecoder().decode(
    chunks.reduce((acc, c) => {
      const m = new Uint8Array(acc.byteLength + c.byteLength)
      m.set(acc)
      m.set(c, acc.byteLength)
      return m
    }, new Uint8Array(0))
  )

  if (!xml.trim()) {
    throw new JobExtractError('The RSS feed is empty.', 422)
  }

  const items = parseRssItems(xml)
  if (items.length === 0) {
    throw new JobExtractError('No jobs found in the RSS feed.', 422)
  }

  return items
}

export const WE_WORK_REMOTELY_RSS_URL = 'https://weworkremotely.com/remote-jobs.rss'
