import { createClient } from '@/lib/supabase/server'
import { requireEmployer } from '@/lib/auth/requireEmployer'
import EmployerOnlyGate from '@/components/EmployerOnlyGate'
import CandidatesListView, { type CandidateCard } from './CandidatesListView'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

// Explicit display fields — email and phone are intentionally NEVER selected.
const DISPLAY_FIELDS = 'user_id, full_name, title, location, bio, skills, avatar_url, years_experience, availability, work_preference'

export default async function CandidatesPage({ searchParams }: { searchParams: { page?: string } }) {
  // Must be signed in as an employer — redirect() throws, so this call stays
  // outside any try/catch (see requireEmployer for details).
  const isEmployer = await requireEmployer('/candidates')
  if (!isEmployer) return <EmployerOnlyGate message="Candidate profiles are visible to employer accounts only." />

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let candidates: CandidateCard[] = []
  let total = 0

  try {
    // Normal RLS-respecting client — the "Employers can view candidate
    // profiles" policy enforces the employer check at the database level.
    const supabase = createClient()
    const { data, count } = await supabase
      .from('profiles')
      .select(DISPLAY_FIELDS, { count: 'exact' })
      .eq('role', 'candidate')
      .order('created_at', { ascending: false })
      .range(from, to)

    candidates = (data as unknown as CandidateCard[] | null) ?? []
    total = count ?? 0
  } catch {
    // Supabase unavailable — render an empty list rather than a 500
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return <CandidatesListView candidates={candidates} page={page} totalPages={totalPages} total={total} />
}
