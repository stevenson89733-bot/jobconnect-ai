import { Markdown } from '@/lib/docExport'

// Templates render this SAME shape — never a separate data source. Switching
// templates is purely a layout/rendering choice and can never alter or drop
// content.
export type ResumeContent = {
  name: string
  contact: string
  title: string
  summary: string
  experience: string
  skills: string
  education: string
}

export type ResumeTemplateId = 'classic' | 'modern'

const SECTIONS: { key: 'summary' | 'experience' | 'skills' | 'education'; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills' },
  { key: 'education', label: 'Education' },
]

function Section({
  label,
  text,
  labelClassName,
  textClassName,
}: {
  label: string
  text: string
  labelClassName: string
  textClassName: string
}) {
  if (!text.trim()) return null
  return (
    <div>
      <div className={labelClassName}>{label}</div>
      <Markdown text={text} className={textClassName} />
    </div>
  )
}

// Single column, no decoration — optimized for ATS parsing. This mirrors
// the plain rendering the Resume Builder already used before templates
// existed, kept as the safe default.
function ClassicTemplate({ content }: { content: ResumeContent }) {
  return (
    <div className="space-y-4 text-sm font-mono">
      <div>
        <div className="text-slate-900 dark:text-white font-bold text-base">{content.name}</div>
        {content.title && <div className="text-primary text-xs">{content.title}</div>}
        {content.contact && <div className="text-slate-600 dark:text-slate-400 text-xs">{content.contact}</div>}
      </div>
      {SECTIONS.map(({ key, label }) => (
        <Section
          key={key}
          label={label}
          text={content[key]}
          labelClassName="text-orange-600 dark:text-accent text-xs font-bold uppercase tracking-wider mb-1"
          textClassName="text-slate-700 dark:text-slate-300 leading-relaxed space-y-1"
        />
      ))}
    </div>
  )
}

// Two-column: a sidebar (contact + skills + education) and a main column
// (summary + experience), subtle accent-colored headers. Still plain
// text/divs only — no images, no tables — so it stays ATS-safe.
function ModernTemplate({ content }: { content: ResumeContent }) {
  const sidebarLabel = 'text-primary text-xs font-bold uppercase tracking-wider mb-1'
  const mainLabel = 'text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-1 border-b border-primary/30 pb-1'
  const bodyText = 'text-slate-700 dark:text-slate-300 leading-relaxed space-y-1'

  return (
    <div className="text-sm font-mono">
      <div className="mb-4 pb-3 border-b-2 border-primary">
        <div className="text-slate-900 dark:text-white font-bold text-xl">{content.name}</div>
        {content.title && <div className="text-primary text-sm">{content.title}</div>}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1 space-y-4">
          {content.contact && (
            <div>
              <div className={sidebarLabel}>Contact</div>
              <div className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed break-words">
                {content.contact.split(' | ').map((line) => <div key={line}>{line}</div>)}
              </div>
            </div>
          )}
          <Section key="skills" label="Skills" text={content.skills} labelClassName={sidebarLabel} textClassName={bodyText} />
          <Section key="education" label="Education" text={content.education} labelClassName={sidebarLabel} textClassName={bodyText} />
        </div>
        <div className="col-span-2 space-y-4">
          <Section key="summary" label="Summary" text={content.summary} labelClassName={mainLabel} textClassName={bodyText} />
          <Section key="experience" label="Experience" text={content.experience} labelClassName={mainLabel} textClassName={bodyText} />
        </div>
      </div>
    </div>
  )
}

export default function ResumePreview({ content, template }: { content: ResumeContent; template: ResumeTemplateId }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5">
      {template === 'modern' ? <ModernTemplate content={content} /> : <ClassicTemplate content={content} />}
    </div>
  )
}
