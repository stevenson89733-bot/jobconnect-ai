// Structured profile sections (Projects/Certificates/Languages) and the
// Timeline's parsing of the EXISTING free-text Experience/Education fields
// — pure rendering logic, never a separately stored/fabricated field.

export type Project = {
  id: string
  title: string
  description: string
  link: string
  dates: string
}

export type Certificate = {
  id: string
  name: string
  issuer: string
  date: string
  credentialUrl: string
}

export type Language = {
  id: string
  name: string
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native'
}

export const PROFICIENCY_LEVELS: Language['proficiency'][] = ['Basic', 'Conversational', 'Fluent', 'Native']

// Defensive parsing — a candidate's saved jsonb could in principle be
// malformed (manual DB edit, future schema change); never let that crash
// the page, just drop what doesn't look like a real record.
export function parseProjects(value: unknown): Project[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
    .map((p) => ({
      id: typeof p.id === 'string' ? p.id : crypto.randomUUID(),
      title: typeof p.title === 'string' ? p.title : '',
      description: typeof p.description === 'string' ? p.description : '',
      link: typeof p.link === 'string' ? p.link : '',
      dates: typeof p.dates === 'string' ? p.dates : '',
    }))
    .filter((p) => p.title.trim().length > 0)
}

export function parseCertificates(value: unknown): Certificate[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .map((c) => ({
      id: typeof c.id === 'string' ? c.id : crypto.randomUUID(),
      name: typeof c.name === 'string' ? c.name : '',
      issuer: typeof c.issuer === 'string' ? c.issuer : '',
      date: typeof c.date === 'string' ? c.date : '',
      credentialUrl: typeof c.credentialUrl === 'string' ? c.credentialUrl : '',
    }))
    .filter((c) => c.name.trim().length > 0)
}

export function parseLanguages(value: unknown): Language[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((l): l is Record<string, unknown> => !!l && typeof l === 'object')
    .map((l) => ({
      id: typeof l.id === 'string' ? l.id : crypto.randomUUID(),
      name: typeof l.name === 'string' ? l.name : '',
      proficiency: (PROFICIENCY_LEVELS as string[]).includes(l.proficiency as string)
        ? (l.proficiency as Language['proficiency'])
        : 'Conversational',
    }))
    .filter((l) => l.name.trim().length > 0)
}

export type TimelineEntry = {
  dateLabel: string | null // null when no real date could be parsed — never invented
  text: string
}

// Real profiles in this app write Experience/Education as blocks separated
// by a blank line, each usually starting with a date or date range
// ("Oct 2021 - Present: ...", "2020-2021: ..."). This extracts that leading
// date when the pattern is actually there; if a block doesn't match, it's
// still included (never dropped) just without a date badge — entries stay
// in the order the candidate wrote them (already roughly reverse-
// chronological in practice) rather than risking mis-sorting on a
// mis-parsed date.
const DATE_PREFIX = /^\s*((?:[A-Za-z]{3,9}\.?\s+)?\d{4}\s*[-–—]\s*(?:Present|(?:[A-Za-z]{3,9}\.?\s+)?\d{4}))\s*:\s*(.*)$/s

export function parseTimeline(text: string | null | undefined): TimelineEntry[] {
  const blocks = (text ?? '')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)

  return blocks.map((block) => {
    const match = block.match(DATE_PREFIX)
    if (match) return { dateLabel: match[1].trim(), text: match[2].trim() }
    return { dateLabel: null, text: block }
  })
}
