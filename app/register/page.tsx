import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RegisterClient from './RegisterClient'

export const dynamic = 'force-dynamic'

export default async function Register() {
  let isLoggedIn = false
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch {}

  if (isLoggedIn) redirect('/dashboard')

  return <RegisterClient />
}
