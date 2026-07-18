import { NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { renderCoverLetterPdf, type CoverLetterExportContent } from '@/lib/resumeExport/coverLetterPdf'
import { renderCoverLetterDocx } from '@/lib/resumeExport/coverLetterDocx'
import { sanitizeFilenamePart } from '@/lib/resumeExport/filename'
import { buildContactInfo } from '@/lib/resumeContact'

type ExportFormat = 'pdf' | 'docx'

function isCoverLetterContent(value: unknown): value is CoverLetterExportContent {
  if (!value || typeof value !== 'object') return false
  const r = value as Record<string, unknown>
  return ['subject', 'dateLine', 'greeting', 'opening', 'body', 'closing', 'signature'].every((k) => typeof r[k] === 'string')
}

export async function POST(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })

  // Same reasoning as resume export: no LLM call here, but rendering a
  // document is real server work — light limit stops a scripted loop
  // without getting in a real candidate's way.
  const { ok: withinLimit } = rateLimit(`cover-letter-export:${user.id}`, 20, 60 * 60 * 1000)
  if (!withinLimit) return NextResponse.json({ error: t('tooManyExports') }, { status: 429 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, full_name, email, phone, linkedin_url, github_url, portfolio_url')
    .eq('user_id', user.id)
    .single()
  if (!profile?.is_premium) {
    return NextResponse.json({ error: t('coverLetterExportPremiumOnly') }, { status: 403 })
  }

  const body = await req.json().catch(() => null) as { letter?: unknown; companyName?: string; format?: ExportFormat } | null
  if (!body || !isCoverLetterContent(body.letter)) {
    return NextResponse.json({ error: t('missingOrInvalidCoverLetterContent') }, { status: 400 })
  }
  const letter = body.letter
  const format: ExportFormat = body.format === 'docx' ? 'docx' : 'pdf'

  const hasContent = !!(letter.opening.trim() || letter.body.trim() || letter.closing.trim())
  if (!hasContent) {
    return NextResponse.json({ error: t('generateCoverLetterFirstExport') }, { status: 400 })
  }

  // Real candidate name pulled fresh from the profile server-side (same
  // trust boundary as resume export) rather than parsed out of the
  // client-supplied signature text.
  const contact = buildContactInfo(profile, user.email)
  const companyName = (body.companyName ?? '').trim()
  const filenameBase = `${sanitizeFilenamePart(contact.name, 'CoverLetter')}_CoverLetter${companyName ? `_${sanitizeFilenamePart(companyName)}` : ''}`

  try {
    if (format === 'docx') {
      const buffer = await renderCoverLetterDocx(letter)
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filenameBase}.docx"`,
        },
      })
    }

    const buffer = await renderCoverLetterPdf(letter)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filenameBase}.pdf"`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export failed'
    console.error('[cover-letter/export]', message)
    return NextResponse.json({ error: t('somethingWentWrongGeneratingFile') }, { status: 500 })
  }
}
