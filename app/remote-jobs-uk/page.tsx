import type { Metadata } from 'next'
import RemoteJobsLanding from '@/components/seo/RemoteJobsLanding'
import { getLandingMarket } from '@/lib/seo/landing-data'
import { SITE_URL } from '@/lib/seo'

const market = getLandingMarket('remote-jobs-uk')!

export const metadata: Metadata = {
  title:       market.title,
  description: market.metaDescription,
  alternates:  { canonical: `${SITE_URL}/remote-jobs-uk` },
  openGraph: {
    title:       market.openGraph.title,
    description: market.openGraph.description,
    url:         `${SITE_URL}/remote-jobs-uk`,
    siteName:    'JobConnect AI',
    type:        'website',
    images:      [{ url: `${SITE_URL}/images/blog/hero-uk.jpg`, width: 1200, height: 630, alt: market.openGraph.title }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       market.openGraph.title,
    description: market.openGraph.description,
    images:      [`${SITE_URL}/images/blog/hero-uk.jpg`],
  },
}

export default function Page() {
  return <RemoteJobsLanding market={market} />
}
