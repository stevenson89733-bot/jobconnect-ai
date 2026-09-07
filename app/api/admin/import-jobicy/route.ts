import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  return xml.match(regex)?.[1] || ''
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
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('user_id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  let imported = 0
  let deduplicated = 0

  try {
    const res = await fetch('https://jobicy.com/?feed=job_feed', {
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()

    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1]
      const title = extractTag(item, 'title')
      const link = extractTag(item, 'link')
      const description = extractTag(item, 'description')
      const company = extractTag(item, 'company') || 'Unknown'

      if (!title || !link) continue

      const { data: byUrl } = await admin
        .from('jobs').select('id').eq('apply_url', link).limit(1)
      if (byUrl?.[0]) { deduplicated++; continue }

      const { data: byTitle } = await admin
        .from('jobs').select('id')
        .ilike('title', title.trim())
        .ilike('company_name', company.trim())
        .limit(1)
      if (byTitle?.[0]) { deduplicated++; continue }

      const { error } = await admin.from('jobs').insert({
        title: cleanHTML(title),
        company_name: cleanHTML(company),
        description: cleanHTML(description) || '',
        location: 'Remote',
        work_type: 'remote',
        job_type: 'Full-time',
        category: 'Other',
        tags: [],
        apply_url: link,
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
    return NextResponse.json({ source: 'jobicy', imported, deduplicated, error: String(err) })
  }
}
