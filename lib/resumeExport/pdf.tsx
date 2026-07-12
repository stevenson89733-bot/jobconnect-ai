import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import { parseMarkdown, type MarkdownBlock } from './markdown'
import type { ResumeContent, ResumeTemplateId } from '@/components/resume-builder/ResumePreview'

// Server-only module (imported by app/api/resume/export/route.ts). Never
// import this from a client component — @react-pdf/renderer is a large
// dependency that has no business in the browser bundle.
//
// Uses Helvetica, one of the 14 standard PDF fonts built into
// @react-pdf/renderer — no font registration/download needed, and it stays
// a real selectable-text font (ATS-readable), never a rasterized image.

const ACCENT = '#2563EB'
const TEXT = '#1e293b'
const MUTED = '#64748b'

const styles = StyleSheet.create({
  page: { padding: 60, fontSize: 10, fontFamily: 'Helvetica', color: TEXT },
  name: { fontSize: 32, fontWeight: 700, marginBottom: 4 },
  title: { fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 10 },
  contact: { fontSize: 9, color: MUTED, marginBottom: 6 },
  headerDivider: { borderBottomWidth: 2.5, borderBottomColor: '#94a3b8', marginTop: 8, marginBottom: 26 },
  sectionLabel: { fontSize: 9, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: 1, marginTop: 30, marginBottom: 10 },
  sectionDivider: { borderBottomWidth: 0.75, borderBottomColor: '#e2e8f0', marginTop: 8, marginBottom: 24 },
  heading: { fontSize: 11, fontWeight: 700, marginTop: 18, marginBottom: 4 },
  paragraph: { fontSize: 10, lineHeight: 1.4, marginBottom: 9, textAlign: 'justify' },
  bulletRow: { flexDirection: 'row', marginBottom: 7 },
  bulletMark: { width: 10, fontSize: 10 },
  bulletText: { fontSize: 10, lineHeight: 1.4, flex: 1, textAlign: 'justify' },
  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
  boldItalic: { fontWeight: 700, fontStyle: 'italic' },
  // Modern-only
  modernHeader: { borderBottomWidth: 3, borderBottomColor: ACCENT, paddingBottom: 16, marginBottom: 28 },
  modernName: { fontSize: 34, fontWeight: 700, marginBottom: 4 },
  row: { flexDirection: 'row' },
  sidebar: { width: '32%', paddingRight: 18 },
  main: { width: '68%' },
  sidebarLabel: { fontSize: 9, fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  contactLine: { fontSize: 8.5, color: MUTED, marginBottom: 3 },
})

function runStyle(r: MarkdownBlock['runs'][number]): Style | undefined {
  if (r.bold && r.italic) return styles.boldItalic
  if (r.bold) return styles.bold
  if (r.italic) return styles.italic
  return undefined
}

function Runs({ runs, style }: { runs: MarkdownBlock['runs']; style: Style }) {
  return (
    <Text style={style}>
      {runs.map((r, i) => {
        const rStyle = runStyle(r)
        return rStyle ? <Text key={i} style={rStyle}>{r.text}</Text> : <Text key={i}>{r.text}</Text>
      })}
    </Text>
  )
}

function Blocks({ text }: { text: string }) {
  const blocks = parseMarkdown(text)
  return (
    <>
      {blocks.map((b, i) =>
        b.type === 'bullet' ? (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletMark}>•</Text>
            <Runs runs={b.runs} style={styles.bulletText} />
          </View>
        ) : b.type === 'heading' ? (
          <Runs key={i} runs={b.runs} style={styles.heading} />
        ) : (
          <Runs key={i} runs={b.runs} style={styles.paragraph} />
        )
      )}
    </>
  )
}

function Section({ label, text, divider = false }: { label: string; text: string; divider?: boolean }) {
  if (!text.trim()) return null
  return (
    <View>
      {divider ? <View style={styles.sectionDivider} /> : null}
      <Text style={styles.sectionLabel}>{label}</Text>
      <Blocks text={text} />
    </View>
  )
}

function ClassicPdf({ content }: { content: ResumeContent }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.name}>{content.name}</Text>
      {content.title ? <Text style={styles.title}>{content.title}</Text> : null}
      {content.contact ? <Text style={styles.contact}>{content.contact}</Text> : null}
      <View style={styles.headerDivider} />
      <Section label="Summary" text={content.summary} />
      <Section label="Experience" text={content.experience} divider={!!content.summary.trim()} />
      <Section label="Skills" text={content.skills} divider={!!content.experience.trim()} />
      <Section label="Education" text={content.education} divider={!!content.skills.trim()} />
    </Page>
  )
}

function ModernPdf({ content }: { content: ResumeContent }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.modernHeader}>
        <Text style={styles.modernName}>{content.name}</Text>
        {content.title ? <Text style={styles.title}>{content.title}</Text> : null}
      </View>
      <View style={styles.row}>
        <View style={styles.sidebar}>
          {content.contact ? (
            <View>
              <Text style={styles.sidebarLabel}>Contact</Text>
              {content.contact.split(' | ').map((line) => <Text key={line} style={styles.contactLine}>{line}</Text>)}
            </View>
          ) : null}
          <Section label="Skills" text={content.skills} />
          <Section label="Education" text={content.education} divider={!!content.skills.trim()} />
        </View>
        <View style={styles.main}>
          <Section label="Summary" text={content.summary} />
          <Section label="Experience" text={content.experience} divider={!!content.summary.trim()} />
        </View>
      </View>
    </Page>
  )
}

export async function renderResumePdf(content: ResumeContent, template: ResumeTemplateId): Promise<Buffer> {
  const page = template === 'modern' ? <ModernPdf content={content} /> : <ClassicPdf content={content} />
  return renderToBuffer(<Document>{page}</Document>)
}
