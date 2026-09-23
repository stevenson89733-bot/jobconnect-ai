export const maxDuration = 10

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as svc } from '@supabase/supabase-js'
import { effectiveEmployerPlan } from '@/lib/adminAccess'

// CSV columns expected: name, email (required), channel (optional), notes (optional)
function parseCSV(text: string): { name: string; email: string; channel?: string; notes?: string }[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
  const nameIdx = headers.indexOf('name')
  const emailIdx = headers.indexOf('email')
  const channelIdx = headers.indexOf('channel')
  const notesIdx = headers.indexOf('notes')

  if (nameIdx === -1 || emailIdx === -1) return []

  return lines.slice(1).flatMap(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const name = cols[nameIdx] ?? ''
    const email = cols[emailIdx] ?? ''
    if (!name || !email || !email.includes('@')) return []
    return [{
      name,
      email,
      channel: channelIdx >= 0 ? (cols[channelIdx] || 'LinkedIn') : 'LinkedIn',
      notes: notesIdx >= 0 ? cols[notesIdx] : undefined,
    }]
  })
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('employer_plan, is_admin, role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'employer' && !profile?.is_admin) {
    return NextResponse.json({ error: 'Employers only' }, { status: 403 })
  }
  const plan = effectiveEmployerPlan(profile ?? {})
  if (plan === 'free') {
    return NextResponse.json({ error: 'Growth plan or above required' }, { status: 403 })
  }

  let csvText: string
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData().catch(() => null)
    const file = form?.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 500_000) return NextResponse.json({ error: 'File too large (max 500 KB)' }, { status: 413 })
    csvText = await file.text()
  } else {
    const body = await req.json().catch(() => ({}))
    csvText = body.csv ?? ''
  }

  if (!csvText) return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 })

  const rows = parseCSV(csvText)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid rows found. CSV must have "name" and "email" columns.' }, { status: 422 })
  }
  if (rows.length > 200) {
    return NextResponse.json({ error: 'Maximum 200 contacts per import' }, { status: 422 })
  }

  const admin = svc(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: inserted, error } = await admin
    .from('outreach_contacts')
    .insert(rows.map(r => ({
      name: r.name,
      channel: r.channel ?? 'LinkedIn',
      notes: r.notes ?? null,
    })))
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ imported: inserted?.length ?? 0 })
}
