import type { Metadata } from 'next'
import RemoteJobsLanding from '@/components/seo/RemoteJobsLanding'
import { getLandingMarket } from '@/lib/seo/landing-data'
import { SITE_URL } from '@/lib/seo'

const market = getLandingMarket('remote-jobs-france')!

export const metadata: Metadata = {
  title:       market.title,
  description: market.metaDescription,
  alternates:  { canonical: `${SITE_URL}/remote-jobs-france` },
  openGraph: {
    title:       market.openGraph.title,
    description: market.openGraph.description,
    url:         `${SITE_URL}/remote-jobs-france`,
    siteName:    'JobConnect AI',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       market.openGraph.title,
    description: market.openGraph.description,
  },
}

export default function Page() {
  return <RemoteJobsLanding market={market} />
}
