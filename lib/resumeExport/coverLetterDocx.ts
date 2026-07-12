import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, LineRuleType } from 'docx'
import { parseMarkdown, type MarkdownBlock } from './markdown'
import type { CoverLetterExportContent } from './coverLetterPdf'

// Server-only module (imported by app/api/cover-letter/export/route.ts) —
// same markdown parsing and spacing/justification conventions as the
// resume DOCX export, applied to a single-column letter instead of a
// multi-section resume.

const MUTED = '64748B'
// Same as the resume DOCX export: default Word page is 12240 twips wide;
// this margin keeps the letter off the page edge.
const PAGE_MARGIN = 2000

function runsToTextRuns(runs: MarkdownBlock['runs']): TextRun[] {
  return runs.map((r) => new TextRun({ text: r.text, bold: r.bold, italics: r.italic }))
}

// 1.5 line spacing: OOXML's w:line is in 240ths of a line for lineRule
// "auto", so single = 240 and 1.5x = 360 — applied to the body paragraphs
// (not the heading type, which is a short sub-heading, not letter body).
const BODY_LINE_SPACING = { line: 360, lineRule: LineRuleType.AUTO }

function blocksToParagraphs(text: string): Paragraph[] {
  return parseMarkdown(text).map((b) => {
    if (b.type === 'bullet') {
      return new Paragraph({ children: runsToTextRuns(b.runs), bullet: { level: 0 }, spacing: { after: 180, ...BODY_LINE_SPACING }, alignment: AlignmentType.JUSTIFIED })
    }
    if (b.type === 'heading') {
      return new Paragraph({
        children: b.runs.map((r) => new TextRun({ text: r.text, bold: true, italics: r.italic })),
        spacing: { before: 360, after: 120 },
      })
    }
    return new Paragraph({ children: runsToTextRuns(b.runs), spacing: { after: 220, ...BODY_LINE_SPACING }, alignment: AlignmentType.JUSTIFIED })
  })
}

const headerDividerBorder = { style: BorderStyle.SINGLE, size: 18, color: '94A3B8', space: 1 }

export async function renderCoverLetterDocx(content: CoverLetterExportContent): Promise<Buffer> {
  const header: Paragraph[] = []
  if (content.subject) {
    header.push(new Paragraph({ children: [new TextRun({ text: content.subject, color: MUTED, size: 18 })], spacing: { after: 80 } }))
  }
  if (content.dateLine) {
    header.push(new Paragraph({ children: [new TextRun({ text: content.dateLine, color: MUTED, size: 18 })], spacing: { after: 120 } }))
  }
  header.push(new Paragraph({ children: [], border: { bottom: headerDividerBorder }, spacing: { after: 320 } }))
  if (content.greeting) {
    header.push(new Paragraph({ children: [new TextRun({ text: content.greeting, size: 20 })], spacing: { after: 220 } }))
  }

  const signature = content.signature.split('\n').map((line) =>
    new Paragraph({ children: [new TextRun({ text: line, size: 20 })], spacing: { after: 60 } })
  )

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN } } },
      children: [
        ...header,
        ...blocksToParagraphs(content.opening),
        ...blocksToParagraphs(content.body),
        ...blocksToParagraphs(content.closing),
        ...signature,
      ],
    }],
  })

  return Packer.toBuffer(doc)
}
