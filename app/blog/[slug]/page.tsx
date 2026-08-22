import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { BLOG_POSTS, getPost, formatDate } from '@/lib/blog/posts'
import { SITE_URL } from '@/lib/seo'

// Article content components — one per slug
import GermanyArticle       from '../content/how-to-get-remote-job-in-germany-as-foreigner'
import ResumeFormatArticle  from '../content/resume-format-by-country'
import FakeJobsArticle      from '../content/how-to-spot-fake-remote-jobs'

const CONTENT_MAP: Record<string, React.ComponentType> = {
  'how-to-get-remote-job-in-germany-as-foreigner': GermanyArticle,
  'resume-format-by-country':                      ResumeFormatArticle,
  'how-to-spot-fake-remote-jobs':                  FakeJobsArticle,
}

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPost(params.slug)
  if (!post) return {}

  return {
    title:       `${post.title} | JobConnect AI Blog`,
    description: post.excerpt,
    alternates:  { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title:       post.title,
      description: post.excerpt,
      url:         `${SITE_URL}/blog/${post.slug}`,
      siteName:    'JobConnect AI',
      type:        'article',
      publishedTime: post.date,
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.title,
      description: post.excerpt,
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
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
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
            Search remote jobs filtered for international candidates — with AI-powered resume tools built for each country.
          </p>
          <Link href="/jobs" className="btn-primary px-8 py-3 text-base font-semibold inline-block">
            Browse Remote Jobs →
          </Link>
        </div>

        {/* Related posts */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">More from the blog</h3>
          <div className="space-y-3">
            {BLOG_POSTS.filter(p => p.slug !== post.slug).map(p => (
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
