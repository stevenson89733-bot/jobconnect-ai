import EmployerSidebar from '@/components/dashboard/EmployerSidebar'
import type { ReactNode } from 'react'

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F7F9FD] dark:bg-[#0d1117]">
      <EmployerSidebar />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}
