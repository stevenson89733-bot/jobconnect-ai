import { createAdminClient } from '@/lib/supabase/admin'
import { requireEmployer } from '@/lib/auth/requireEmployer'
import EmployerOnlyGate from '@/components/EmployerOnlyGate'
import CandidatesListView, { type CandidateCard } from './CandidatesListView'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

// Explicit display fields — email is intentionally NEVER selected.
const DISPLAY_FIELDS = 'user_id, full_name, title, location, bio, skills'

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
    // TODO: service-role bypass, not the intended end state — see
    // supabase/employer_read_candidates_proposal.sql. Once that RLS policy is
    // applied, swap createAdminClient() for the normal createClient() so the
    // database (not just requireEmployer()) enforces the employer check.
    const admin = createAdminClient()
    const { data, count } = await admin
      .from('profiles')
      .select(DISPLAY_FIELDS, { count: 'exact' })
      .eq('role', 'candidate')
      .order('created_at', { ascending: false })
      .range(from, to)

    candidates = (data as unknown as CandidateCard[] | null) ?? []
    total = count ?? 0
  } catch {
    // service role unavailable — render an empty list rather than a 500
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return <CandidatesListView candidates={candidates} page={page} totalPages={totalPages} total={total} />
}
