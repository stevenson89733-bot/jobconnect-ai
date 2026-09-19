import CandidateSidebar from '@/components/dashboard/CandidateSidebar'
import type { ReactNode } from 'react'

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F7F9FD] dark:bg-[#0d1117]">
      <CandidateSidebar />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}
