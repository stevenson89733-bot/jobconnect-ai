export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: number
  category: string
  categoryColor: string
  ctaHref?: string
  ctaText?: string
  ctaSubtext?: string
  relatedPages?: { label: string; href: string }[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug:          'how-to-get-remote-job-france-international',
    title:         'How to Get a Remote Job in France as an International Candidate (2026)',
    excerpt:       'France tech is international — but only in certain sectors and at certain company stages. Learn the legal structures, CV format, lettre de motivation rules, and which platforms French companies actually use to hire globally.',
    date:          '2026-08-28',
    readingTime:   9,
    category:      'Country Guides',
    categoryColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    ctaHref:       '/remote-jobs-france',
    ctaText:       'Browse French remote jobs →',
    ctaSubtext:    'Roles at French tech companies genuinely open to international candidates.',
    relatedPages: [
      { label: '🇫🇷 Remote Jobs in France',              href: '/remote-jobs-france' },
      { label: '📄 Resume Format by Country',            href: '/blog/resume-format-by-country' },
      { label: '🌍 10 Skills for International Hire',    href: '/blog/cross-border-remote-job-skills' },
    ],
  },
  {
    slug:          'remote-job-salary-by-country',
    title:         'Remote Job Salaries by Country: What International Candidates Can Realistically Expect (2026)',
    excerpt:       'Why the $150K posted salary is not your salary as a contractor, how to benchmark correctly across US, UK, Germany, France and Canada, and the red flags that signal a company is underpaying international hires.',
    date:          '2026-08-26',
    readingTime:   9,
    category:      'Career Advice',
    categoryColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    ctaHref:       '/jobs',
    ctaText:       'Find roles with transparent pay ranges →',
    ctaSubtext:    'JobConnect AI surfaces salary info and contractor vs employee status on every listing.',
    relatedPages: [
      { label: '🇺🇸 US Remote Jobs for Internationals',  href: '/blog/how-to-get-remote-job-usa-international' },
      { label: '🌍 10 Skills for International Hire',    href: '/blog/cross-border-remote-job-skills' },
      { label: '🎯 ATS Optimization Guide',              href: '/blog/ats-resume-international-candidates' },
    ],
  },
  {
    slug:          'how-to-get-remote-job-in-germany-as-foreigner',
    title:         'How to Get a Remote Job in Germany as a Foreign National (2026 Guide)',
    excerpt:       'Everything you need to know about the Lebenslauf format, professional photos, cover letters, and which platforms actually hire internationally.',
    date:          '2026-08-15',
    readingTime:   8,
    category:      'Country Guides',
    categoryColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    ctaHref:       '/remote-jobs-germany',
    ctaText:       'Browse German remote jobs →',
    ctaSubtext:    'Filter for roles genuinely open to international candidates.',
    relatedPages: [
      { label: '🇩🇪 Remote Jobs in Germany',        href: '/remote-jobs-germany' },
      { label: '📄 Resume Format by Country',        href: '/blog/resume-format-by-country' },
    ],
  },
  {
    slug:          'resume-format-by-country',
    title:         'Resume Format by Country: US vs UK vs Germany vs France vs Canada',
    excerpt:       'A practical comparison of what hiring managers in 5 countries expect — photos, length, tone, personal information, and the differences that trip up international applicants.',
    date:          '2026-08-10',
    readingTime:   6,
    category:      'Resume Tips',
    categoryColor: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    ctaHref:       '/ai-tools/resume-builder',
    ctaText:       'Build your country-specific resume →',
    ctaSubtext:    'AI resume builder that adapts to US, UK, German, French, and Canadian formats.',
    relatedPages: [
      { label: '🇩🇪 Remote Jobs in Germany', href: '/remote-jobs-germany' },
      { label: '🇫🇷 Remote Jobs in France',  href: '/remote-jobs-france' },
      { label: '🇬🇧 Remote Jobs in the UK',  href: '/remote-jobs-uk' },
    ],
  },
  {
    slug:          'how-to-spot-fake-remote-jobs',
    title:         "How to Tell if a Remote Job Actually Hires Internationally (and Which Don't)",
    excerpt:       'The exact phrases to look for, the red flags that cost you hours of wasted applications, and how our Remote-Friendly Detector automates this for you.',
    date:          '2026-08-05',
    readingTime:   5,
    category:      'Job Search',
    categoryColor: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    ctaHref:       '/jobs',
    ctaText:       'Search pre-filtered remote jobs →',
    ctaSubtext:    'Every listing run through our Remote-Friendly Detector before you see it.',
    relatedPages: [
      { label: '🎯 ATS Tips for International Candidates', href: '/blog/ats-resume-international-candidates' },
      { label: '🌍 10 Skills That Make You Hireable',      href: '/blog/cross-border-remote-job-skills' },
    ],
  },
  {
    slug:          'how-to-get-remote-job-canada-international',
    title:         'How to Get a Remote Job in Canada as an International Candidate (2026)',
    excerpt:       "Canada actively recruits global tech talent — but the rules differ from the US. Here's everything you need to know about work permits, bilingual advantage, and the Canadian application style.",
    date:          '2026-08-22',
    readingTime:   8,
    category:      'Country Guides',
    categoryColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    ctaHref:       '/remote-jobs-canada',
    ctaText:       'Browse Canadian remote jobs →',
    ctaSubtext:    'Roles filtered for international candidates — contractor and employee.',
    relatedPages: [
      { label: '🇨🇦 Remote Jobs in Canada',   href: '/remote-jobs-canada' },
      { label: '🇺🇸 Remote Jobs in the USA',   href: '/remote-jobs-usa' },
      { label: '📄 Resume Format by Country',  href: '/blog/resume-format-by-country' },
    ],
  },
  {
    slug:          'remote-work-france-foreigner',
    title:         'Working Remotely for a French Company as a Foreigner: What You Need to Know',
    excerpt:       'French professional culture, the CV format with no photo, the art of the lettre de motivation, and the platforms where international candidates actually find French remote roles.',
    date:          '2026-08-20',
    readingTime:   7,
    category:      'Country Guides',
    categoryColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    ctaHref:       '/remote-jobs-france',
    ctaText:       'Browse French remote jobs →',
    ctaSubtext:    'French companies that genuinely hire international remote workers.',
    relatedPages: [
      { label: '🇫🇷 Remote Jobs in France',         href: '/remote-jobs-france' },
      { label: '📄 Resume Format by Country',        href: '/blog/resume-format-by-country' },
    ],
  },
  {
    slug:          'cross-border-remote-job-skills',
    title:         'The 10 Skills That Make You Hireable Internationally (For Remote Jobs)',
    excerpt:       'Technical skills get you through the door. These 10 cross-border skills determine whether a company in Germany, Canada, or the UK actually hires you over a local candidate.',
    date:          '2026-08-18',
    readingTime:   6,
    category:      'Career Advice',
    categoryColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    ctaHref:       '/jobs',
    ctaText:       'Find remote jobs matching your skills →',
    ctaSubtext:    'AI-matched remote roles for international candidates.',
    relatedPages: [
      { label: '🎯 ATS Optimization Guide',        href: '/blog/ats-resume-international-candidates' },
      { label: '🌍 Remote-Friendly Job Checklist', href: '/blog/how-to-spot-fake-remote-jobs' },
    ],
  },
  {
    slug:          'ats-resume-international-candidates',
    title:         'ATS Optimization for International Candidates: Why Your Resume Gets Rejected',
    excerpt:       'Most international candidates are filtered out before a human ever reads their resume. Here is exactly how ATS systems work, why international resumes fail, and how to fix yours.',
    date:          '2026-08-16',
    readingTime:   6,
    category:      'Resume Tips',
    categoryColor: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    ctaHref:       '/ai-tools/resume-builder',
    ctaText:       'Build your ATS-optimized resume →',
    ctaSubtext:    'Our AI resume builder formats your CV to pass international ATS filters.',
    relatedPages: [
      { label: '📄 Resume Format by Country',       href: '/blog/resume-format-by-country' },
      { label: '🌍 10 Skills for International Hire', href: '/blog/cross-border-remote-job-skills' },
    ],
  },
  {
    slug:          'how-to-get-remote-job-usa-international',
    title:         'How to Get a Remote Job in the USA as an International Candidate (2026)',
    excerpt:       'The US is the largest remote job market — but most listings exclude non-US candidates by default. Learn W-2 vs 1099 vs Corp-to-Corp, how to detect genuinely international-open roles, and how to position yourself to win.',
    date:          '2026-08-24',
    readingTime:   10,
    category:      'Country Guides',
    categoryColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    ctaHref:       '/remote-jobs-usa',
    ctaText:       'Browse US remote jobs open to internationals →',
    ctaSubtext:    'Pre-filtered for C2C, EOR-supported, and global-remote US roles.',
    relatedPages: [
      { label: '🇺🇸 Remote Jobs in the USA',              href: '/remote-jobs-usa' },
      { label: '🎯 ATS Optimization for Internationals',  href: '/blog/ats-resume-international-candidates' },
      { label: '🔍 Spot Roles That Actually Hire Globally', href: '/blog/how-to-spot-fake-remote-jobs' },
    ],
  },
  {
    slug:          'remote-job-uk-international',
    title:         'How to Land a Remote Job in the UK as a Non-UK Resident (2026)',
    excerpt:       "Post-Brexit, right-to-work rules, British CV format, and which UK sectors genuinely hire international remote workers — everything you need to run a smart UK job search.",
    date:          '2026-08-14',
    readingTime:   8,
    category:      'Country Guides',
    categoryColor: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    ctaHref:       '/remote-jobs-uk',
    ctaText:       'Browse UK remote jobs →',
    ctaSubtext:    'UK companies filtered for international candidates — with right-to-work clarity.',
    relatedPages: [
      { label: '🇬🇧 Remote Jobs in the UK',         href: '/remote-jobs-uk' },
      { label: '📄 Resume Format by Country',        href: '/blog/resume-format-by-country' },
      { label: '🎯 ATS Optimization Guide',          href: '/blog/ats-resume-international-candidates' },
    ],
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
