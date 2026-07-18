import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { renderResumePdf } from '@/lib/resumeExport/pdf'
import { renderResumeDocx } from '@/lib/resumeExport/docx'
import { sanitizeFilenamePart } from '@/lib/resumeExport/filename'
import type { ResumeContent, ResumeTemplateId } from '@/components/resume-builder/ResumePreview'

type ExportFormat = 'pdf' | 'docx'

function isResumeContent(value: unknown): value is ResumeContent {
  if (!value || typeof value !== 'object') return false
  const r = value as Record<string, unknown>
  return ['name', 'contact', 'title', 'summary', 'experience', 'skills', 'education'].every((k) => typeof r[k] === 'string')
}

export async function POST(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })

  // No LLM call here, but rendering a document is real server work — a
  // light limit is enough to stop a scripted loop without getting in a real
  // candidate's way (they're exporting one resume a handful of times, not
  // hundreds).
  const { ok: withinLimit } = rateLimit(`resume-export:${user.id}`, 20, 60 * 60 * 1000)
  if (!withinLimit) return NextResponse.json({ error: t('tooManyExports') }, { status: 429 })

  const { data: profile } = await supabase.from('profiles').select('is_premium').eq('user_id', user.id).single()
  if (!profile?.is_premium) {
    return NextResponse.json({ error: t('resumeExportPremiumOnly') }, { status: 403 })
  }

  const body = await req.json().catch(() => null) as { resume?: unknown; template?: ResumeTemplateId; format?: ExportFormat } | null
  if (!body || !isResumeContent(body.resume)) {
    return NextResponse.json({ error: t('missingOrInvalidResumeContent') }, { status: 400 })
  }
  const resume = body.resume
  const template: ResumeTemplateId = body.template === 'modern' ? 'modern' : 'classic'
  const format: ExportFormat = body.format === 'docx' ? 'docx' : 'pdf'

  const hasContent = !!(resume.summary.trim() || resume.experience.trim() || resume.skills.trim() || resume.education.trim())
  if (!resume.name.trim() || !hasContent) {
    return NextResponse.json({ error: t('generateResumeFirstExport') }, { status: 400 })
  }

  const filenameBase = `${sanitizeFilenamePart(resume.name, 'Resume')}_Resume`

  try {
    if (format === 'docx') {
      const buffer = await renderResumeDocx(resume, template)
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filenameBase}.docx"`,
        },
      })
    }

    const buffer = await renderResumePdf(resume, template)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filenameBase}.pdf"`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export failed'
    console.error('[resume/export]', message)
    return NextResponse.json({ error: t('somethingWentWrongGeneratingFile') }, { status: 500 })
  }
}
