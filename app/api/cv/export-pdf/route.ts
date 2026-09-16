import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { renderResumePdf } from '@/lib/resumeExport/pdf'
import { sanitizeFilenamePart } from '@/lib/resumeExport/filename'
import type { ResumeContent } from '@/components/resume-builder/ResumePreview'
import type { ResumeLabels } from '@/lib/resumeExport/labels'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_premium, full_name').eq('user_id', user.id).single()
  if (!profile?.is_premium) {
    return NextResponse.json({ error: 'CV export is a Premium feature.' }, { status: 403 })
  }

  const { ok: withinLimit } = rateLimit(`cv-export:${user.id}`, 20, 60 * 60 * 1000)
  if (!withinLimit) return NextResponse.json({ error: 'Too many exports. Try again later.' }, { status: 429 })

  const body = await req.json().catch(() => null) as {
    name?: string; title?: string; contact?: string
    summary?: string; experience?: string; skills?: string
    education?: string; languages?: string; additionalSections?: string
  } | null

  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const content: ResumeContent = {
    name: body.name ?? profile.full_name ?? 'Candidate',
    title: body.title ?? '',
    contact: body.contact ?? '',
    summary: body.summary ?? '',
    experience: body.experience ?? '',
    skills: body.skills ?? '',
    education: [body.education, body.languages, body.additionalSections].filter(Boolean).join('\n\n'),
  }

  const labels: ResumeLabels = {
    summary: 'Professional Summary',
    experience: 'Work Experience',
    skills: 'Skills',
    education: 'Education & Languages',
    contact: 'Contact',
  }

  const filenameBase = `${sanitizeFilenamePart(content.name, 'CV')}_CV`

  const buffer = await renderResumePdf(content, 'classic', labels)
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filenameBase}.pdf"`,
    },
  })
}
