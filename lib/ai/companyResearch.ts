// Real web search for company facts (Tavily) — feeds the cover letter
// prompt with genuinely sourced context instead of letting the model
// generate plausible-sounding company claims from training data. A direct
// REST call rather than an SDK: it's a single endpoint, one request shape,
// no benefit to an extra dependency for it.
//
// Never fabricates: any failure mode (no API key configured, network
// error, non-200 response, empty results) resolves to `{ found: false }`,
// which the caller treats identically to "no results" — the letter then
// generates without company-specific claims, exactly as speced.

const TAVILY_URL = 'https://api.tavily.com/search'

export type CompanySource = { title: string; url: string }

export type CompanyResearchResult =
  | { found: true; summary: string; sources: CompanySource[] }
  | { found: false }

type TavilyResult = { title: string; url: string; content: string }
type TavilyResponse = { answer?: string; results?: TavilyResult[] }

// Tavily fuzzy-matches even nonsense queries to *something* (e.g. an
// unrelated "Vortex Dynamics" for a made-up "Zqlvorntex Dynamiks Xzy") —
// without this check those irrelevant results would get fed to the model as
// if they were real facts about the candidate's actual target company. We
// require the real company name (or most of its significant words) to
// literally appear in what Tavily returned before trusting it as "found".
function isRelevant(companyName: string, haystack: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const name = normalize(companyName)
  const text = normalize(haystack)
  if (!name) return false
  if (text.includes(name)) return true

  const words = name.split(' ').filter((w) => w.length >= 3)
  if (words.length === 0) return false
  const matched = words.filter((w) => text.includes(w)).length
  return matched / words.length >= 0.6
}

export async function researchCompany(companyName: string): Promise<CompanyResearchResult> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) return { found: false }

  try {
    const res = await fetch(TAVILY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${companyName} company overview mission recent news`,
        search_depth: 'basic',
        include_answer: true,
        max_results: 5,
      }),
    })
    if (!res.ok) return { found: false }

    const data = (await res.json()) as TavilyResponse

    // Strip markdown link/citation noise ("* [text](url)." nav dumps some
    // pages return) — cleanup only, never adds or changes the substance of
    // what was actually returned.
    const clean = (text: string) =>
      text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*+/g, '').replace(/\s+/g, ' ').trim()

    const results = (data.results ?? [])
      .map((r) => ({ ...r, content: clean(r.content ?? '') }))
      .filter((r) => r.content.length > 40) // drop near-empty/junk-only snippets
      .filter((r) => isRelevant(companyName, `${r.title} ${r.content}`))

    // Tavily's "answer" is itself an LLM synthesis — it can echo/hallucinate
    // around the company name from the query alone even when there's no real
    // supporting page behind it, so it's only trusted when at least one real,
    // relevant result backs it up. No relevant results at all → not found.
    if (results.length === 0) return { found: false }
    const relevantAnswer = data.answer?.trim() && isRelevant(companyName, data.answer) ? data.answer.trim() : undefined

    // Real returned text only — snippets are truncated for prompt size, not
    // rewritten/embellished. The generation prompt is told to use ONLY this
    // text, nothing beyond it.
    const snippets = results.slice(0, 4).map((r) => `- ${r.content.slice(0, 400)}`)
    const summary = [relevantAnswer, ...snippets].filter(Boolean).join('\n')
    if (!summary.trim()) return { found: false }

    const sources = results.slice(0, 4).map((r) => ({ title: r.title, url: r.url }))
    return { found: true, summary, sources }
  } catch (err) {
    console.error('[companyResearch]', err instanceof Error ? err.message : 'search failed')
    return { found: false }
  }
}
