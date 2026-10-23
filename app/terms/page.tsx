import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LegalDocument, { type LegalDoc } from '@/components/legal/LegalDocument'

export const metadata: Metadata = {
  title: 'Terms of Service | JobConnect AI',
  description: 'Terms of Service for JobConnect AI, a product of SJL Technologies LLC (Wyoming, USA).',
}

export default async function TermsPage() {
  const t = await getTranslations('termsPage')
  return <LegalDocument doc={t.raw('doc') as LegalDoc} />
}
