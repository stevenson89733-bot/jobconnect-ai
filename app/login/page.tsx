import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/LoginForm'

export const dynamic = 'force-dynamic'

export default async function Login({ searchParams }: { searchParams: { error?: string } }) {
  let isLoggedIn = false
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch {}

  if (isLoggedIn) redirect('/dashboard')

  return (
    <Suspense>
      <LoginForm error={searchParams.error} />
    </Suspense>
  )
}
