import { Mail, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import ContactForm from './ContactForm'

// Real, functional contact channels (verified receiving + sending), but
// standby — not actively monitored 24/7 — so the copy says so honestly
// rather than implying round-the-clock support.
const CONTACT_EMAIL = 'contact@jobconnect-ai.com'
const CONTACT_PHONE_DISPLAY = '+84 37 3697 948'
const CONTACT_PHONE_TEL = '+84373697948'

export default async function Contact() {
  const t = await getTranslations('contactPage')

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{t('intro')}</p>
      </div>

      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t('standbyTitle')}</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{t('standbyNote')}</p>
        <div className="space-y-3">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors"
          >
            <Mail className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>{CONTACT_EMAIL}</span>
          </a>
          <a
            href={`tel:${CONTACT_PHONE_TEL}`}
            className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors"
          >
            <Phone className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>{CONTACT_PHONE_DISPLAY}</span>
          </a>
        </div>
      </div>

      <ContactForm />
    </div>
  )
}
