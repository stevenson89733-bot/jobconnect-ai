export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: number
  category: string
  categoryColor: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug:          'how-to-get-remote-job-in-germany-as-foreigner',
    title:         'How to Get a Remote Job in Germany as a Foreign National (2026 Guide)',
    excerpt:       'Everything you need to know about the Lebenslauf format, professional photos, cover letters, and which platforms actually hire internationally.',
    date:          '2026-08-15',
    readingTime:   8,
    category:      'Country Guides',
    categoryColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  {
    slug:          'resume-format-by-country',
    title:         'Resume Format by Country: US vs UK vs Germany vs France vs Canada',
    excerpt:       'A practical comparison of what hiring managers in 5 countries expect — photos, length, tone, personal information, and the differences that trip up international applicants.',
    date:          '2026-08-10',
    readingTime:   6,
    category:      'Resume Tips',
    categoryColor: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  },
  {
    slug:          'how-to-spot-fake-remote-jobs',
    title:         'How to Tell if a Remote Job Actually Hires Internationally (and Which Don\'t)',
    excerpt:       'The exact phrases to look for, the red flags that cost you hours of wasted applications, and how our Remote-Friendly Detector automates this for you.',
    date:          '2026-08-05',
    readingTime:   5,
    category:      'Job Search',
    categoryColor: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}
