import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, TableLayoutType,
} from 'docx'
import { parseMarkdown, type MarkdownBlock } from './markdown'
import type { ResumeContent, ResumeTemplateId } from '@/components/resume-builder/ResumePreview'

// Server-only module (imported by app/api/resume/export/route.ts) — same
// resume content and template choice as the PDF export and the on-screen
// ResumePreview, just rendered through docx's native Word primitives
// instead of a browser-based HTML/PDF conversion.

const ACCENT = '2563EB'
const MUTED = '64748B'
// Default Word margin is 1440 twips (1in) — bumped up so the layout
// doesn't run right up to the page edge.
const PAGE_MARGIN = 2000

function runsToTextRuns(runs: MarkdownBlock['runs']): TextRun[] {
  return runs.map((r) => new TextRun({ text: r.text, bold: r.bold, italics: r.italic }))
}

function blocksToParagraphs(text: string): Paragraph[] {
  return parseMarkdown(text).map((b) => {
    if (b.type === 'bullet') {
      return new Paragraph({ children: runsToTextRuns(b.runs), bullet: { level: 0 }, spacing: { after: 180 }, alignment: AlignmentType.JUSTIFIED })
    }
    if (b.type === 'heading') {
      return new Paragraph({
        children: b.runs.map((r) => new TextRun({ text: r.text, bold: true, italics: r.italic })),
        spacing: { before: 360, after: 120 },
      })
    }
    return new Paragraph({ children: runsToTextRuns(b.runs), spacing: { after: 220 }, alignment: AlignmentType.JUSTIFIED })
  })
}

const dividerBorder = { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0', space: 4 }
const headerDividerBorder = { style: BorderStyle.SINGLE, size: 18, color: '94A3B8', space: 1 }

function sectionParagraphs(label: string, text: string, headingColor = ACCENT, divider = false): Paragraph[] {
  if (!text.trim()) return []
  const heading = new Paragraph({
    children: [new TextRun({ text: label.toUpperCase(), bold: true, color: headingColor, size: 18 })],
    spacing: { before: 500, after: 200 },
    border: divider ? { top: dividerBorder } : undefined,
  })
  return [heading, ...blocksToParagraphs(text)]
}

function headerParagraphs(content: ResumeContent): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: content.name, bold: true, size: 48 })], spacing: { after: 80 } }),
  ]
  if (content.title) {
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: content.title, color: ACCENT, bold: true, size: 24 })], spacing: { after: 200 } }))
  }
  if (content.contact) {
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: content.contact, color: MUTED, size: 18 })], spacing: { after: 120 } }))
  }
  paragraphs.push(new Paragraph({ children: [], border: { bottom: headerDividerBorder }, spacing: { after: 460 } }))
  return paragraphs
}

function buildClassicDoc(content: ResumeContent): Document {
  return new Document({
    sections: [{
      properties: { page: { margin: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN } } },
      children: [
        ...headerParagraphs(content),
        ...sectionParagraphs('Summary', content.summary),
        ...sectionParagraphs('Experience', content.experience, ACCENT, !!content.summary.trim()),
        ...sectionParagraphs('Skills', content.skills, ACCENT, !!content.experience.trim()),
        ...sectionParagraphs('Education', content.education, ACCENT, !!content.skills.trim()),
      ],
    }],
  })
}

// Modern: a borderless two-column table (sidebar: contact/skills/education,
// main: summary/experience) — the closest native-DOCX equivalent to the
// on-screen two-column layout without embedding it as an image.
function buildModernDoc(content: ResumeContent): Document {
  const contactParagraphs = content.contact
    ? [
        new Paragraph({ children: [new TextRun({ text: 'CONTACT', bold: true, color: ACCENT, size: 18 })], spacing: { after: 100 } }),
        ...content.contact.split(' | ').map((line) => new Paragraph({ children: [new TextRun({ text: line, color: MUTED, size: 16 })], spacing: { after: 60 } })),
      ]
    : []

  const sidebar = [
    ...contactParagraphs,
    ...sectionParagraphs('Skills', content.skills, ACCENT, contactParagraphs.length > 0),
    ...sectionParagraphs('Education', content.education, ACCENT, !!content.skills.trim()),
  ]
  const main = [
    ...sectionParagraphs('Summary', content.summary),
    ...sectionParagraphs('Experience', content.experience, ACCENT, !!content.summary.trim()),
  ]

  // The default page is 12240 twips wide (US Letter); with PAGE_MARGIN on
  // each side that leaves 12240 - 2*PAGE_MARGIN of usable width. Without an
  // explicit `layout: FIXED` + `columnWidths`, docx only writes a placeholder
  // 100-twip <w:gridCol> per column — some renderers treat that grid as
  // authoritative regardless of the per-cell pct width, which collapsed the
  // whole table to a sliver and forced every cell's text (Education's long
  // institution names especially) to wrap character-by-character.
  const contentWidth = 12240 - 2 * PAGE_MARGIN
  const sidebarWidth = Math.round(contentWidth * 0.32)
  const mainWidth = contentWidth - sidebarWidth
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: [sidebarWidth, mainWidth],
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
    rows: [
      new TableRow({
        children: [
          new TableCell({ width: { size: sidebarWidth, type: WidthType.DXA }, children: sidebar.length ? sidebar : [new Paragraph('')] }),
          new TableCell({ width: { size: mainWidth, type: WidthType.DXA }, children: main.length ? main : [new Paragraph('')] }),
        ],
      }),
    ],
  })

  return new Document({
    sections: [{
      properties: { page: { margin: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN } } },
      children: [
        ...headerParagraphs(content),
        table,
      ],
    }],
  })
}

export async function renderResumeDocx(content: ResumeContent, template: ResumeTemplateId): Promise<Buffer> {
  const doc = template === 'modern' ? buildModernDoc(content) : buildClassicDoc(content)
  return Packer.toBuffer(doc)
}
