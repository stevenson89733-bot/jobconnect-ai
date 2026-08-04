'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { updateProfile } from '@/app/actions/profile'
import EditableSection from '@/components/profile/EditableSection'

const inputClass =
  'w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5'

type CompanyFields = { company_name: string; company_website: string; company_description: string }

// Note (see supabase/profile_employer_fields.sql and its own commit message):
// jobs.company_name is a snapshot copied at post time, not re-read from
// here — editing this never changes an already-posted job, and only ever
// pre-fills PostJobModal's (still-editable) company field for future posts.
export default function EmployerProfileEditor({ initial }: { initial: CompanyFields }) {
  const t = useTranslations('employerProfile')

  const [company, setCompany] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [editing, setEditing] = useState(false)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div className="mb-2">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
          <Link href="/recruiter" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('breadcrumbDashboard')}</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">{t('breadcrumbProfile')}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
      </div>

      <EditableSection
        title={t('sectionCompany')}
        description={t('sectionCompanyDesc')}
        editing={editing}
        onEdit={() => { setDraft(company); setEditing(true) }}
        onCancel={() => { setDraft(company); setEditing(false) }}
        onSave={async () => {
          const res = await updateProfile(draft)
          if (res.ok) { setCompany(draft); setEditing(false) }
          return res
        }}
        renderView={() => (
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{company.company_name || t('addCompanyNamePrompt')}</h2>
            {company.company_website && (
              <a href={company.company_website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary dark:text-blue-400 hover:underline break-all">
                {company.company_website}
              </a>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
              {company.company_description || t('addCompanyDescriptionPrompt')}
            </p>
          </div>
        )}
        renderEdit={() => (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>{t('companyName')}</label>
              <input
                value={draft.company_name}
                onChange={(e) => setDraft((d) => ({ ...d, company_name: e.target.value }))}
                placeholder={t('companyNamePlaceholder')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('companyWebsite')} <span className="text-slate-500 dark:text-slate-500">{t('optional')}</span></label>
              <input
                type="url"
                value={draft.company_website}
                onChange={(e) => setDraft((d) => ({ ...d, company_website: e.target.value }))}
                placeholder={t('companyWebsitePlaceholder')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t('companyDescription')} <span className="text-slate-500 dark:text-slate-500">{t('optional')}</span></label>
              <textarea
                value={draft.company_description}
                onChange={(e) => setDraft((d) => ({ ...d, company_description: e.target.value }))}
                rows={5}
                placeholder={t('companyDescriptionPlaceholder')}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        )}
      />
    </div>
  )
}
