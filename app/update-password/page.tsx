import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import UpdatePasswordForm from '@/components/UpdatePasswordForm'

export const dynamic = 'force-dynamic'

export default async function UpdatePassword({ searchParams }: { searchParams: { error?: string } }) {
  // Only reachable with the session /auth/callback established from a valid
  // recovery link — landing here any other way means there's no session to
  // call updateUser() against, so send them back to request a new link.
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const t = await getTranslations('errors')
    redirect(`/forgot-password?error=${encodeURIComponent(t('passwordResetLinkInvalid'))}`)
  }

  return (
    <Suspense>
      <UpdatePasswordForm error={searchParams.error} />
    </Suspense>
  )
}
