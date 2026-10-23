import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'

/**
 * Renders a legal document (Terms / Privacy) from structured translation
 * messages, read with `t.raw()` so legal wording never goes through ICU
 * parsing (apostrophes, braces, "$" stay literal in every locale).
 *
 * Shape: { title, lastUpdated, intro: string[], sections: { id?, title, blocks }[] }
 * (`id` makes a section linkable, e.g. /terms#acceptable-use)
 * where each block is a paragraph (string) or a bulleted list (string[]).
 * Inline markup inside any string: **bold**, [label](/path), bare email
 * addresses (auto-linked with mailto:) and international phone numbers
 * starting with "+" (auto-linked with tel:, forced LTR so they read correctly
 * inside right-to-left text).
 */
export type LegalDoc = {
  title: string
  lastUpdated: string
  intro: string[]
  sections: { id?: string; title: string; blocks: (string | string[])[] }[]
}

const PHONE = /^\+\d[\d ()-]{6,}\d$/
const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\+\d[\d ()-]{6,}\d)/g

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
    if (link) {
      return <Link key={i} href={link[2]} className="text-blue-400 underline hover:text-white">{link[1]}</Link>
    }
    if (/^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/.test(part)) {
      return <a key={i} href={`mailto:${part}`} className="text-blue-400 underline hover:text-white">{part}</a>
    }
    if (PHONE.test(part)) {
      return <a key={i} href={`tel:${part.replace(/[^\d+]/g, '')}`} dir="ltr" className="text-blue-400 underline hover:text-white">{part}</a>
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">{doc.title}</h1>
        <p className="text-slate-400 mb-8">{doc.lastUpdated}</p>

        <div className="space-y-4 text-slate-300 leading-relaxed mb-10">
          {doc.intro.map((p, i) => <p key={i}>{inline(p)}</p>)}
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          {doc.sections.map((section) => (
            <section key={section.title} id={section.id} className="scroll-mt-24">
              <h2 className="text-2xl font-semibold text-white mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.blocks.map((block, i) =>
                  Array.isArray(block) ? (
                    <ul key={i} className="list-disc ps-6 space-y-2">
                      {block.map((item, j) => <li key={j}>{inline(item)}</li>)}
                    </ul>
                  ) : (
                    <p key={i}>{inline(block)}</p>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
