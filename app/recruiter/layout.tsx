import EmployerSidebar from '@/components/dashboard/EmployerSidebar'

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <EmployerSidebar />
      <main className="flex-1 md:ml-56">
        {children}
      </main>
    </div>
  )
}
