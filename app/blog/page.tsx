import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { BLOG_POSTS, formatDate, getPostThumbnail } from '@/lib/blog/posts'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title:       'Blog — Remote Job Tips for International Candidates | JobConnect AI',
  description: 'Practical guides on resume formats, country-specific hiring norms, and how to find remote jobs that genuinely hire internationally.',
  alternates:  { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title:       'JobConnect AI Blog',
    description: 'Practical guides on international remote job search, resume formats by country, and hiring norms.',
    url:         `${SITE_URL}/blog`,
    siteName:    'JobConnect AI',
    type:        'website',
  },
}

const CATEGORY_FILTERS = [
  { label: '🌍 All',          value: '' },
  { label: '🗺️ Country Guides', value: 'Country Guides' },
  { label: '💼 Career Advice', value: 'Career Advice' },
  { label: '📄 Resume Tips',   value: 'Resume Tips' },
  { label: '🔍 Job Search',    value: 'Job Search' },
]

export default function BlogPage({
  searchParams,
}: {
  searchParams?: { category?: string }
}) {
  const activeCategory = searchParams?.category ?? ''
  const todayStr = new Date().toISOString().slice(0, 10)
  const filtered = BLOG_POSTS
    .filter((p) => p.date <= todayStr)
    .filter((p) => !activeCategory || p.category === activeCategory)

  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const [featured, ...rest] = sorted

  return (
    <section className="max-w-3xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[32px] md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          JobConnect AI Blog
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Practical guides on international remote job search, country-specific resume formats, and how to tell which remote roles actually hire globally.
        </p>
      </div>

      {/* Category filter bar */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORY_FILTERS.map(({ label, value }) => (
          <Link
            key={value}
            href={value ? `/blog?category=${encodeURIComponent(value)}` : '/blog'}
            className={`text-xs px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
              activeCategory === value
                ? 'bg-primary border-primary text-white'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:text-primary dark:hover:text-blue-400'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Featured article — first result, full-width */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group block mb-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-blue-500/50 hover:shadow-lg transition-all duration-200"
        >
          <div className="relative w-full h-52 sm:h-64">
            <Image
              src={getPostThumbnail(featured)}
              alt={featured.heroImageAlt ?? featured.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${featured.categoryColor} mb-2 inline-block`}>
                {featured.category}
              </span>
              <h2 className="font-extrabold text-lg sm:text-xl text-white leading-snug mt-1">
                {featured.title}
              </h2>
            </div>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{featured.excerpt}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 dark:text-slate-500">
                <span>{formatDate(featured.date)}</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {featured.readingTime} min read</span>
              </div>
            </div>
            <ArrowRight size={18} className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors mt-1" />
          </div>
        </Link>
      )}

      {/* Remaining articles — larger thumbnails */}
      <div className="space-y-4">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-primary/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail — 240×160px rendered */}
              <div className="hidden sm:block flex-shrink-0 relative w-40 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={getPostThumbnail(post)}
                  alt={post.heroImageAlt ?? post.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${post.categoryColor}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(post.date)}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock size={10} /> {post.readingTime} min read
                  </span>
                </div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 leading-snug group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
              <ArrowRight
                size={18}
                className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors mt-1"
              />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <p className="text-4xl mb-3">📭</p>
          <p>No articles in this category yet.</p>
          <Link href="/blog" className="text-primary dark:text-blue-400 text-sm font-semibold hover:underline mt-2 inline-block">
            View all articles
          </Link>
        </div>
      )}
    </section>
  )
}
