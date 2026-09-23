import { createClient } from '@/lib/supabase/server'
import { requireEmployer } from '@/lib/auth/requireEmployer'
import EmployerOnlyGate from '@/components/EmployerOnlyGate'
import EmployerProfileEditor from './EmployerProfileEditor'

export const dynamic = 'force-dynamic'

const FIELDS = 'company_name, company_website, company_description, company_logo_url, company_size'

export default async function EmployerProfilePage() {
  const isEmployer = await requireEmployer('/recruiter/profile')
  if (!isEmployer) return <EmployerOnlyGate />

  let initial = { company_name: '', company_website: '', company_description: '', company_logo_url: '', company_size: '' }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select(FIELDS).eq('user_id', user.id).single()
      if (data) {
        const d = data as unknown as typeof initial
        initial = {
          company_name: d.company_name ?? '',
          company_website: d.company_website ?? '',
          company_description: d.company_description ?? '',
          company_logo_url: d.company_logo_url ?? '',
          company_size: d.company_size ?? '',
        }
      }
    }
  } catch {
    // Supabase unavailable — render the form empty rather than a 500
  }

  return <EmployerProfileEditor initial={initial} />
}
