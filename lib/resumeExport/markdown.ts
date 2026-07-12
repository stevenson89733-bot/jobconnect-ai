// Same subset of Markdown that lib/docExport.tsx renders for the on-screen
// preview (**bold** + bullet lists + paragraphs), but as plain structured
// data instead of React nodes or HTML — so both the PDF (@react-pdf/renderer)
// and DOCX (docx package) builders can turn it into their own native
// paragraph/run primitives without going through the DOM.
export type InlineRun = { text: string; bold: boolean; italic: boolean }
export type MarkdownBlock =
  | { type: 'paragraph'; runs: InlineRun[] }
  | { type: 'bullet'; runs: InlineRun[] }
  | { type: 'heading'; runs: InlineRun[] }

function parseInline(text: string): InlineRun[] {
  return text
    // **bold** first (greedy on the double marker), then single *italic* —
    // the model spontaneously emits both around dates/roles even though
    // neither is requested by the prompt.
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter((part) => part.length > 0)
    .map((part) => {
      const bold = part.match(/^\*\*([^*]+)\*\*$/)
      if (bold) return { text: bold[1], bold: true, italic: false }
      const italic = part.match(/^\*([^*]+)\*$/)
      if (italic) return { text: italic[1], bold: false, italic: true }
      return { text: part, bold: false, italic: false }
    })
}

export function parseMarkdown(text: string | null | undefined): MarkdownBlock[] {
  const lines = (text ?? '').split('\n')
  const blocks: MarkdownBlock[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // The model sometimes emits "### Company Name" style sub-headings inside
    // a field (e.g. Experience) even though the prompt never asks for them —
    // strip the leading #'s (any level 1-6) rather than showing them raw.
    const heading = trimmed.match(/^#{1,6}\s+(.*)$/)
    if (heading) {
      blocks.push({ type: 'heading', runs: parseInline(heading[1]) })
      continue
    }
    const bullet = trimmed.match(/^[-*•]\s+(.*)$/)
    blocks.push({
      type: bullet ? 'bullet' : 'paragraph',
      runs: parseInline(bullet ? bullet[1] : trimmed),
    })
  }
  return blocks
}
