import { Suspense } from 'react'
import ForgotPasswordForm from '@/components/ForgotPasswordForm'

export const dynamic = 'force-dynamic'

export default function ForgotPassword({ searchParams }: { searchParams: { error?: string; sent?: string } }) {
  return (
    <Suspense>
      <ForgotPasswordForm error={searchParams.error} sent={searchParams.sent === '1'} />
    </Suspense>
  )
}
