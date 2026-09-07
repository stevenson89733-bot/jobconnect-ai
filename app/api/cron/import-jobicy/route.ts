import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 10

function parseXML(xml: string) {
  const jobs: any[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]
    const title = extractTag(item, 'title')
    const link = extractTag(item, 'link')
    const description = extractTag(item, 'description')
    const pubDate = extractTag(item, 'pubDate')
    const company = extractTag(item, 'company') || 'Unknown'

    if (title && link) {
      jobs.push({
        title: cleanHTML(title),
        link,
        description: cleanHTML(description),
        pubDate,
        company: cleanHTML(company),
      })
    }
  }
  return jobs
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  const match = xml.match(regex)
  return match?.[1] || ''
}

function cleanHTML(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  let imported = 0
  let deduplicated = 0

  try {
    const res = await fetch('https://jobicy.com/?feed=job_feed', {
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    const jobs = parseXML(xml)

    for (const j of jobs) {
      const { data: byUrl } = await supabase
        .from('jobs').select('id').eq('apply_url', j.link).limit(1)
      if (byUrl?.[0]) { deduplicated++; continue }

      const { data: byTitle } = await supabase
        .from('jobs').select('id')
        .ilike('title', j.title.trim())
        .ilike('company_name', j.company.trim())
        .limit(1)
      if (byTitle?.[0]) { deduplicated++; continue }

      const { error } = await supabase.from('jobs').insert({
        title: j.title,
        company_name: j.company,
        description: j.description || '',
        location: 'Remote',
        work_type: 'remote',
        job_type: 'Full-time',
        category: 'Other',
        tags: [],
        apply_url: j.link,
        source: 'jobicy',
        salary_min: null,
        salary_max: null,
        salary_label: null,
        is_active: true,
        posted_by: null,
      })
      if (error) console.error('[import-jobicy] insert:', error.message)
      else imported++
    }
    return NextResponse.json({ source: 'jobicy', imported, deduplicated })
  } catch (err) {
    console.error('[import-jobicy] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ source: 'jobicy', imported: 0, deduplicated: 0, error: String(err) })
  }
}
