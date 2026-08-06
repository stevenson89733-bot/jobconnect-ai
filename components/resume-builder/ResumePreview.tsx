import { useTranslations } from 'next-intl'
import { Markdown } from '@/lib/docExport'
import { User } from 'lucide-react'

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

const PHOTO_MARKER = /^\[PHOTO[^\]]*\]\s*/

function PhotoBox() {
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
      style={{ width: 80, height: 104 }}
      aria-label="Photo placeholder"
    >
      <User size={28} strokeWidth={1.5} />
      <span className="text-[9px] uppercase tracking-wide leading-none">Photo</span>
    </div>
  )
}

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

function ClassicTemplate({ content, showPhotoPlaceholder }: { content: ResumeContent; showPhotoPlaceholder: boolean }) {
  const t = useTranslations('resumeBuilder')
  const cleanSummary = content.summary.replace(PHOTO_MARKER, '')
  const sections: { key: 'summary' | 'experience' | 'skills' | 'education'; label: string }[] = [
    { key: 'summary', label: t('sectionSummary') },
    { key: 'experience', label: t('sectionExperience') },
    { key: 'skills', label: t('sectionSkills') },
    { key: 'education', label: t('sectionEducation') },
  ]
  return (
    <div className="space-y-4 text-sm font-mono">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-slate-900 dark:text-white font-bold text-base">{content.name}</div>
          {content.title && <div className="text-primary dark:text-blue-400 text-xs">{content.title}</div>}
          {content.contact && <div className="text-slate-600 dark:text-slate-400 text-xs">{content.contact}</div>}
        </div>
        {showPhotoPlaceholder && <PhotoBox />}
      </div>
      {sections.map(({ key, label }) => (
        <Section
          key={key}
          label={label}
          text={key === 'summary' ? cleanSummary : content[key]}
          labelClassName="text-orange-600 dark:text-accent text-xs font-bold uppercase tracking-wider mb-1"
          textClassName="text-slate-700 dark:text-slate-300 leading-relaxed space-y-1"
        />
      ))}
    </div>
  )
}

function ModernTemplate({ content, showPhotoPlaceholder }: { content: ResumeContent; showPhotoPlaceholder: boolean }) {
  const t = useTranslations('resumeBuilder')
  const cleanSummary = content.summary.replace(PHOTO_MARKER, '')
  const sidebarLabel = 'text-primary dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1'
  const mainLabel = 'text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-1 border-b border-primary/30 pb-1'
  const bodyText = 'text-slate-700 dark:text-slate-300 leading-relaxed space-y-1'

  return (
    <div className="text-sm font-mono">
      <div className="mb-4 pb-3 border-b-2 border-primary flex items-start justify-between gap-4">
        <div>
          <div className="text-slate-900 dark:text-white font-bold text-xl">{content.name}</div>
          {content.title && <div className="text-primary dark:text-blue-400 text-sm">{content.title}</div>}
        </div>
        {showPhotoPlaceholder && <PhotoBox />}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1 space-y-4">
          {content.contact && (
            <div>
              <div className={sidebarLabel}>{t('sectionContact')}</div>
              <div className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed break-words">
                {content.contact.split(' | ').map((line) => <div key={line}>{line}</div>)}
              </div>
            </div>
          )}
          <Section key="skills" label={t('sectionSkills')} text={content.skills} labelClassName={sidebarLabel} textClassName={bodyText} />
          <Section key="education" label={t('sectionEducation')} text={content.education} labelClassName={sidebarLabel} textClassName={bodyText} />
        </div>
        <div className="col-span-2 space-y-4">
          <Section key="summary" label={t('sectionSummary')} text={cleanSummary} labelClassName={mainLabel} textClassName={bodyText} />
          <Section key="experience" label={t('sectionExperience')} text={content.experience} labelClassName={mainLabel} textClassName={bodyText} />
        </div>
      </div>
    </div>
  )
}

export default function ResumePreview({
  content,
  template,
  showPhotoPlaceholder = false,
}: {
  content: ResumeContent
  template: ResumeTemplateId
  showPhotoPlaceholder?: boolean
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5">
      {template === 'modern'
        ? <ModernTemplate content={content} showPhotoPlaceholder={showPhotoPlaceholder} />
        : <ClassicTemplate content={content} showPhotoPlaceholder={showPhotoPlaceholder} />}
    </div>
  )
}
