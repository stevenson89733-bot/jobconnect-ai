import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import { parseMarkdown, type MarkdownBlock } from './markdown'

// Server-only module (imported by app/api/cover-letter/export/route.ts).
// A cover letter is a single-column letter, not a multi-section resume, so
// this reuses the shared markdown parser and the same fonts/spacing/
// justification conventions already proven in pdf.tsx rather than a
// separate Runs/Blocks implementation with its own bugs to find.

export type CoverLetterExportContent = {
  subject: string
  dateLine: string
  greeting: string
  opening: string
  body: string
  closing: string
  signature: string
}

const TEXT = '#1e293b'
const MUTED = '#64748b'

const styles = StyleSheet.create({
  page: { padding: 60, fontSize: 10, fontFamily: 'Helvetica', color: TEXT },
  subject: { fontSize: 9, color: MUTED, marginBottom: 4 },
  date: { fontSize: 9, color: MUTED, marginBottom: 16 },
  headerDivider: { borderBottomWidth: 1.5, borderBottomColor: '#94a3b8', marginBottom: 22 },
  greeting: { fontSize: 10, marginBottom: 14 },
  heading: { fontSize: 11, fontWeight: 700, marginTop: 18, marginBottom: 4 },
  // 1.5 is mathematically exact here (measured: 15pt gap for 10pt font),
  // but react-pdf/Helvetica renders visually tighter than Word's 1.5-line
  // rule (Times New Roman's taller natural leading) — bumped to close that
  // visual gap between the two exports rather than chase an exact multiplier.
  paragraph: { fontSize: 10, lineHeight: 1.65, marginBottom: 12, textAlign: 'justify' },
  bulletRow: { flexDirection: 'row', marginBottom: 7 },
  bulletMark: { width: 10, fontSize: 10 },
  bulletText: { fontSize: 10, lineHeight: 1.65, flex: 1, textAlign: 'justify' },
  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
  boldItalic: { fontWeight: 700, fontStyle: 'italic' },
  signatureLine: { fontSize: 10, lineHeight: 1.5, marginTop: 4 },
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

// Runs the model's raw field text through the same markdown parser as the
// Resume Builder — so any stray ###/**/* markers the model emits here (it
// has, in testing, on the resume side) get rendered properly instead of
// leaking through as literal characters.
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

function CoverLetterPage({ content }: { content: CoverLetterExportContent }) {
  return (
    <Page size="A4" style={styles.page}>
      {content.subject ? <Text style={styles.subject}>{content.subject}</Text> : null}
      {content.dateLine ? <Text style={styles.date}>{content.dateLine}</Text> : null}
      <View style={styles.headerDivider} />
      {content.greeting ? <Text style={styles.greeting}>{content.greeting}</Text> : null}
      <Blocks text={content.opening} />
      <Blocks text={content.body} />
      <Blocks text={content.closing} />
      <View>
        {content.signature.split('\n').map((line, i) => (
          <Text key={i} style={styles.signatureLine}>{line}</Text>
        ))}
      </View>
    </Page>
  )
}

export async function renderCoverLetterPdf(content: CoverLetterExportContent): Promise<Buffer> {
  return renderToBuffer(<Document><CoverLetterPage content={content} /></Document>)
}
