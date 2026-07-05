import { type ReactNode } from 'react'

/**
 * Shared document helpers for the AI tools (resume + cover letter).
 *
 * - `Markdown` renders a subset of Markdown (**bold** + bullet lists) as real
 *   React elements for on-screen previews — no dangerouslySetInnerHTML.
 * - `mdToHtml` produces the same formatting as an escaped HTML string for the
 *   print document.
 * - `printAsPdf` opens a print-optimized window so the browser's "Save as PDF"
 *   yields a real PDF with SELECTABLE TEXT (ATS-readable), not a rasterized image.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Inline: convert **bold** into <strong>. Escaping runs first, so the regex
// only ever sees literal ** markers (never HTML), keeping this XSS-safe.
function inlineToHtml(text: string): string {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

/** Convert **bold** + bullet lines + paragraphs to an escaped HTML string. */
export function mdToHtml(text: string): string {
  const lines = (text ?? '').split('\n')
  let html = ''
  let inList = false
  const closeList = () => {
    if (inList) {
      html += '</ul>'
      inList = false
    }
  }
  for (const line of lines) {
    const trimmed = line.trim()
    const bullet = trimmed.match(/^[-*•]\s+(.*)$/)
    if (bullet) {
      if (!inList) {
        html += '<ul>'
        inList = true
      }
      html += `<li>${inlineToHtml(bullet[1])}</li>`
    } else if (trimmed === '') {
      closeList()
    } else {
      closeList()
      html += `<p>${inlineToHtml(trimmed)}</p>`
    }
  }
  closeList()
  return html
}

// Inline React renderer for **bold**.
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    /^\*\*[^*]+\*\*$/.test(part) ? (
      <strong key={i} className="font-semibold text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

/** Render a subset of Markdown (**bold**, bullet lists, paragraphs) as React nodes. */
export function Markdown({ text, className }: { text: string; className?: string }) {
  const lines = (text ?? '').split('\n')
  const blocks: ReactNode[] = []
  let listItems: ReactNode[] = []

  const flushList = (key: string) => {
    if (listItems.length) {
      blocks.push(
        <ul key={key} className="list-disc pl-5 space-y-1">
          {listItems}
        </ul>
      )
      listItems = []
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    const bullet = trimmed.match(/^[-*•]\s+(.*)$/)
    if (bullet) {
      listItems.push(<li key={i}>{renderInline(bullet[1])}</li>)
    } else if (trimmed === '') {
      flushList(`ul-${i}`)
    } else {
      flushList(`ul-${i}`)
      blocks.push(<p key={i}>{renderInline(trimmed)}</p>)
    }
  })
  flushList('ul-end')

  return <div className={className}>{blocks}</div>
}

const PRINT_CSS = `
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 24px; color: #1e293b; font-size: 13px; line-height: 1.6; }
  h1 { font-size: 24px; margin: 0 0 2px; }
  .title { font-size: 14px; color: #2563eb; font-weight: 600; margin-bottom: 4px; }
  .contact { color: #64748b; font-size: 12px; margin-bottom: 16px; }
  .subject { font-size: 12px; color: #64748b; margin-bottom: 20px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #2563eb; border-bottom: 1.5px solid #2563eb; padding-bottom: 3px; margin: 18px 0 8px; }
  p { margin: 0 0 8px; }
  ul { margin: 0 0 8px; padding-left: 20px; }
  li { margin: 0 0 4px; }
  strong { font-weight: 700; }
  .score { background: #f1f5f9; border-radius: 6px; padding: 6px 12px; display: inline-block; font-size: 12px; margin-bottom: 16px; }
  @media print { body { margin: 0 auto; } @page { margin: 18mm; } }
`

/**
 * Open a print-optimized window and trigger the browser print dialog.
 * The user's "Save as PDF" produces a real PDF with selectable text.
 * `title` becomes the default PDF filename.
 */
export function printAsPdf(bodyHtml: string, title: string) {
  const win = window.open('', '_blank', 'width=820,height=1060')
  if (!win) {
    alert('Please allow pop-ups for this site to download your PDF.')
    return
  }
  win.document.open()
  win.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escapeHtml(
      title
    )}</title><style>${PRINT_CSS}</style></head><body>${bodyHtml}</body></html>`
  )
  win.document.close()
  win.focus()

  const triggerPrint = () => {
    try {
      win.print()
    } catch {
      /* user closed the window */
    }
  }
  if (win.document.readyState === 'complete') {
    setTimeout(triggerPrint, 300)
  } else {
    win.onload = () => setTimeout(triggerPrint, 200)
  }
}
