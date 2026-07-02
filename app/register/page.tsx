import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RegisterClient from './RegisterClient'

export const dynamic = 'force-dynamic'

export default async function Register() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  } catch {}

  return <RegisterClient />
}
