import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import FadeIn from './FadeIn'

export default function WelcomeHeader({
  firstName,
  initials,
  avatarUrl,
}: {
  firstName: string
  initials: string
  avatarUrl: string | null
}) {
  return (
    <FadeIn className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="w-14 h-14 text-xl">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Your career snapshot</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/jobs"><Button variant="outline" size="md">Browse Jobs</Button></Link>
        <Link href="/profile"><Button variant="primary" size="md">Edit Profile</Button></Link>
      </div>
    </FadeIn>
  )
}
