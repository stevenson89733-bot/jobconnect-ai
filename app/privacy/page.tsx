import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LegalDocument, { type LegalDoc } from '@/components/legal/LegalDocument'

export const metadata: Metadata = {
  title: 'Privacy Policy | JobConnect AI',
  description: 'Privacy Policy for JobConnect AI, a product of SJL Technologies LLC (Wyoming, USA).',
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacyPage')
  return <LegalDocument doc={t.raw('doc') as LegalDoc} />
}
