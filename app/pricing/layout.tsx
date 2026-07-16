import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/seo'

// page.tsx is a client component ('use client', reads Stripe checkout status
// from search params), so its metadata has to live here in the layout —
// content is static (the plans/pricing never vary per request).
export const metadata: Metadata = {
  title: 'Pricing | JobConnect AI',
  description: 'Simple, honest pricing — browse and apply to jobs for free, or upgrade to Premium for AI Resume Builder, Cover Letter Generator, and ATS scoring.',
  alternates: { canonical: absoluteUrl('/pricing') },
  openGraph: {
    title: 'Pricing | JobConnect AI',
    description: 'Simple, honest pricing — free job browsing, or Premium for AI-powered resume and cover letter tools.',
    url: absoluteUrl('/pricing'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pricing | JobConnect AI',
    description: 'Simple, honest pricing — free job browsing, or Premium for AI-powered resume and cover letter tools.',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
