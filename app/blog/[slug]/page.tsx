import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { BLOG_POSTS, getPost, formatDate, getPostHeroImage } from '@/lib/blog/posts'
import { SITE_URL } from '@/lib/seo'

// Article content components — one per slug
import GermanyArticle       from '../content/how-to-get-remote-job-in-germany-as-foreigner'
import ResumeFormatArticle  from '../content/resume-format-by-country'
import FakeJobsArticle      from '../content/how-to-spot-fake-remote-jobs'
import CanadaArticle        from '../content/how-to-get-remote-job-canada-international'
import FranceArticle        from '../content/remote-work-france-foreigner'
import CrossBorderArticle   from '../content/cross-border-remote-job-skills'
import AtsArticle           from '../content/ats-resume-international-candidates'
import UkArticle            from '../content/remote-job-uk-international'
import UsaArticle           from '../content/how-to-get-remote-job-usa-international'
import FranceIntlArticle    from '../content/how-to-get-remote-job-france-international'
import SalaryArticle             from '../content/remote-job-salary-by-country'
import VietnamArticle            from '../content/how-to-find-remote-job-from-vietnam-2026'
import RemoteEtrangerArticle     from '../content/trouver-emploi-remote-depuis-etranger'
import CrossBorderGuideArticle   from '../content/cross-border-remote-jobs-complete-guide'
import TravaillerDistanceArticle from '../content/travailler-distance-entreprise-etrangere'
import FrenchSpeakersArticle     from '../content/best-remote-jobs-french-speakers-2026'
import FrancophoneArticle        from '../content/meilleurs-emplois-remote-francophones-2026'
import IntlNoRelocateArticle     from '../content/international-jobs-without-relocating'
import PostulerSansDemenagerArticle from '../content/postuler-emploi-international-sans-demenager'
import AfricaGlobalArticle          from '../content/remote-jobs-africa-global-companies'
import AfriqueMondialesArticle      from '../content/emploi-remote-afrique-entreprises-mondiales'
import VisaFriendlyArticle          from '../content/visa-friendly-remote-jobs-employers-accept'
import VisaEmployeursArticle        from '../content/emploi-remote-visa-employeurs-acceptent'
import AiMatchingArticle            from '../content/how-ai-job-matching-works'
import MatchingIAArticle            from '../content/matching-ia-emploi-comment-ca-marche'
import InterviewPrepArticle         from '../content/remote-job-interview-prep-international-candidate'
import PreparerEntretienArticle     from '../content/preparer-entretien-emploi-remote-international'
import HireRemoteTalentArticle      from '../content/hire-remote-talent-globally-without-local-entity'
import RecruterTalentsArticle       from '../content/recruter-talents-remote-monde-entier'
import SkillGapGuideArticle         from '../content/skill-gap-analysis-remote-jobs-guide'
import AnalyseCompetencesArticle    from '../content/analyse-competences-avant-postuler'
import LinkedInOptimArticle         from '../content/linkedin-profile-optimization-international-jobs'
import OptimiserLinkedInArticle     from '../content/optimiser-profil-linkedin-emploi-international'
import StateRemoteWork2026Article   from '../content/state-of-cross-border-remote-work-2026'
import TeletravailEtatLieuxArticle  from '../content/teletravail-international-2026-etat-des-lieux'

const CONTENT_MAP: Record<string, React.ComponentType> = {
  'how-to-get-remote-job-in-germany-as-foreigner': GermanyArticle,
  'resume-format-by-country':                      ResumeFormatArticle,
  'how-to-spot-fake-remote-jobs':                  FakeJobsArticle,
  'how-to-get-remote-job-canada-international':    CanadaArticle,
  'remote-work-france-foreigner':                  FranceArticle,
  'cross-border-remote-job-skills':                CrossBorderArticle,
  'ats-resume-international-candidates':           AtsArticle,
  'remote-job-uk-international':                   UkArticle,
  'how-to-get-remote-job-usa-international':       UsaArticle,
  'how-to-get-remote-job-france-international':    FranceIntlArticle,
  'remote-job-salary-by-country':                  SalaryArticle,
  'how-to-find-remote-job-from-vietnam-2026':      VietnamArticle,
  'trouver-emploi-remote-depuis-etranger':         RemoteEtrangerArticle,
  'cross-border-remote-jobs-complete-guide':       CrossBorderGuideArticle,
  'travailler-distance-entreprise-etrangere':      TravaillerDistanceArticle,
  'best-remote-jobs-french-speakers-2026':         FrenchSpeakersArticle,
  'meilleurs-emplois-remote-francophones-2026':    FrancophoneArticle,
  'international-jobs-without-relocating':         IntlNoRelocateArticle,
  'postuler-emploi-international-sans-demenager':  PostulerSansDemenagerArticle,
  'remote-jobs-africa-global-companies':           AfricaGlobalArticle,
  'emploi-remote-afrique-entreprises-mondiales':   AfriqueMondialesArticle,
  'visa-friendly-remote-jobs-employers-accept':    VisaFriendlyArticle,
  'emploi-remote-visa-employeurs-acceptent':       VisaEmployeursArticle,
  'how-ai-job-matching-works':                     AiMatchingArticle,
  'matching-ia-emploi-comment-ca-marche':          MatchingIAArticle,
  'remote-job-interview-prep-international-candidate': InterviewPrepArticle,
  'preparer-entretien-emploi-remote-international':        PreparerEntretienArticle,
  'hire-remote-talent-globally-without-local-entity':      HireRemoteTalentArticle,
  'recruter-talents-remote-monde-entier':                  RecruterTalentsArticle,
  'skill-gap-analysis-remote-jobs-guide':                  SkillGapGuideArticle,
  'analyse-competences-avant-postuler':                    AnalyseCompetencesArticle,
  'linkedin-profile-optimization-international-jobs':      LinkedInOptimArticle,
  'optimiser-profil-linkedin-emploi-international':        OptimiserLinkedInArticle,
  'state-of-cross-border-remote-work-2026':                StateRemoteWork2026Article,
  'teletravail-international-2026-etat-des-lieux':         TeletravailEtatLieuxArticle,
}

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPost(params.slug)
  if (!post) return {}

  const heroUrl = getPostHeroImage(post)

  return {
    title:       `${post.title} | JobConnect AI Blog`,
    description: post.excerpt,
    alternates:  { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title:         post.title,
      description:   post.excerpt,
      url:           `${SITE_URL}/blog/${post.slug}`,
      siteName:      'JobConnect AI',
      type:          'article',
      publishedTime: post.date,
      images:        [{ url: heroUrl, width: 1200, height: 400, alt: post.title }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.title,
      description: post.excerpt,
      images:      [heroUrl],
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const Content = CONTENT_MAP[params.slug]
  if (!Content) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'JobConnect AI',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'JobConnect AI',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    image: getPostHeroImage(post),
  }

  const heroUrl = getPostHeroImage(post)
  const heroAlt = post.heroImageAlt ?? post.title

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero image — full viewport width */}
      <div className="relative w-full h-[260px] sm:h-[360px] md:h-[400px] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={heroUrl}
          alt={heroAlt}
          fill
          unoptimized
          priority
          className="object-cover"
        />
        {/* Subtle gradient overlay so the breadcrumb stays readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${post.categoryColor}`}>
              {post.category}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Calendar size={10} /> {formatDate(post.date)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock size={10} /> {post.readingTime} min read
            </span>
          </div>
          <h1 className="text-[32px] md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            {post.excerpt}
          </p>
          <hr className="border-slate-200 dark:border-slate-800 mt-8" />
        </header>

        {/* Article content */}
        <Content />

        {/* CTA */}
        <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-violet-500/10 dark:from-blue-500/15 dark:to-violet-500/15 border border-primary/20 dark:border-blue-500/20 rounded-2xl text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ready to find your next remote role?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            {post.ctaSubtext ?? 'Search remote jobs filtered for international candidates — with AI-powered resume tools built for each country.'}
          </p>
          <Link href={post.ctaHref ?? '/jobs'} className="btn-primary px-8 py-3 text-base font-semibold inline-block">
            {post.ctaText ?? 'Browse Remote Jobs →'}
          </Link>
        </div>

        {/* Related landing pages (country guides) */}
        {post.relatedPages && post.relatedPages.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Related guides</h3>
            <div className="flex flex-wrap gap-2">
              {post.relatedPages.map(rp => (
                <Link
                  key={rp.href}
                  href={rp.href}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary/40 dark:hover:border-blue-500/40 hover:text-primary dark:hover:text-blue-400 transition-colors"
                >
                  {rp.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related posts */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">More from the blog</h3>
          <div className="space-y-3">
            {BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 4).map(p => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary/40 dark:hover:border-blue-500/40 transition-colors"
              >
                <div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mr-2 ${p.categoryColor}`}>{p.category}</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.title}</span>
                </div>
                <ArrowLeft size={14} className="text-slate-400 rotate-180 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
