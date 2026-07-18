// Shared between app/jobs/page.tsx (cached, public client, SSR page 1) and
// app/api/jobs/route.ts (per-request, cookie client, infinite-scroll pages
// 2+) so both apply identical filters/sort/select — one query definition,
// not two that could quietly drift apart.
export type SortOption = 'relevance' | 'date' | 'salary'

export const JOB_SELECT_FIELDS =
  'id, title, company_name, location, work_type, salary_label, salary_min, salary_max, job_type, category, tags, description, is_featured, created_at, company:companies(logo_url)'

export type JobFilters = {
  q: string
  workType: string
  jobType: string
  category: string
  sort: SortOption
}

export function parseSort(value: string | null | undefined): SortOption {
  return (['relevance', 'date', 'salary'] as const).includes(value as SortOption)
    ? (value as SortOption)
    : 'relevance'
}

export function applyJobFilters<T extends { or: any; ilike: any; eq: any; order: any }>(
  query: T,
  { q, workType, jobType, category, sort }: JobFilters
): T {
  if (q) {
    // Real keyword match across title/company/description only — no
    // fabricated relevance scoring beyond what these ilike hits are.
    const escaped = q.replace(/[%_]/g, (c) => `\\${c}`)
    query = query.or(`title.ilike.%${escaped}%,company_name.ilike.%${escaped}%,description.ilike.%${escaped}%`)
  }
  if (workType && workType !== 'All') query = query.eq('work_type', workType)
  if (jobType && jobType !== 'All') query = query.eq('job_type', jobType)
  if (category && category !== 'All') query = query.eq('category', category)

  if (sort === 'salary') {
    // nullsFirst: false keeps jobs without a real salary_min at the end
    // regardless of sort direction, rather than guessing a value for them.
    query = query.order('salary_min', { ascending: false, nullsFirst: false })
  } else if (sort === 'date') {
    query = query.order('created_at', { ascending: false })
  } else {
    // "Relevance" with no real per-query relevance signal beyond the
    // keyword match itself just means the same sensible default order:
    // featured first, then most recent.
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }
  return query
}

// Supabase's JS types the to-one embedded relation (company_id -> companies)
// as an array even though it's a single FK — flatten to the real shape.
export function normalizeJobCompany<T extends { company: unknown }>(job: T): T & { company: { logo_url: string | null } | null } {
  const company = job.company
  return {
    ...job,
    company: Array.isArray(company) ? (company[0] as { logo_url: string | null } | undefined) ?? null : (company as { logo_url: string | null } | null),
  }
}
