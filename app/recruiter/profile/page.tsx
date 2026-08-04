import { createClient } from '@/lib/supabase/server'
import { requireEmployer } from '@/lib/auth/requireEmployer'
import EmployerOnlyGate from '@/components/EmployerOnlyGate'
import EmployerProfileEditor from './EmployerProfileEditor'

export const dynamic = 'force-dynamic'

const FIELDS = ['company_name', 'company_website', 'company_description'] as const

export default async function EmployerProfilePage() {
  const isEmployer = await requireEmployer('/recruiter/profile')
  if (!isEmployer) return <EmployerOnlyGate />

  let initial = { company_name: '', company_website: '', company_description: '' }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select(FIELDS.join(', ')).eq('user_id', user.id).single()
      if (data) {
        initial = {
          company_name: (data as unknown as typeof initial).company_name ?? '',
          company_website: (data as unknown as typeof initial).company_website ?? '',
          company_description: (data as unknown as typeof initial).company_description ?? '',
        }
      }
    }
  } catch {
    // Supabase unavailable — render the form empty rather than a 500
  }

  return <EmployerProfileEditor initial={initial} />
}
