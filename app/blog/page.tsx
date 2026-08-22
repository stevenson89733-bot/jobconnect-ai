import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { BLOG_POSTS, formatDate } from '@/lib/blog/posts'
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

export default function BlogPage() {
  return (
    <section className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          JobConnect AI Blog
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Practical guides on international remote job search, country-specific resume formats, and how to tell which remote roles actually hire globally.
        </p>
      </div>

      <div className="space-y-5">
        {BLOG_POSTS.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-primary/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${post.categoryColor}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(post.date)}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock size={10} /> {post.readingTime} min read
                  </span>
                </div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
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
    </section>
  )
}
