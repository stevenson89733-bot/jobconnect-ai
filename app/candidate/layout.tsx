import CandidateSidebar from '@/components/dashboard/CandidateSidebar'

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F7F9FD] dark:bg-[#0d1117]">
      <CandidateSidebar />
      <main className="flex-1 min-w-0 md:ml-56 pb-16 md:pb-0">{children}</main>
    </div>
  )
}
