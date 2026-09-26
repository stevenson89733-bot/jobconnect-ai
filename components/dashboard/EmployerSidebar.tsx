'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { label: 'Dashboard',  href: '/employer/dashboard',  icon: '📊' },
  { label: 'Recruiter',  href: '/recruiter',           icon: '🏠' },
  { label: 'Post a Job', href: '/recruiter?post=true',  icon: '➕' },
  { label: 'Candidates', href: '/recruiter',            icon: '👥' },
  { label: 'Profile',    href: '/recruiter/profile',    icon: '🏢' },
]

export default function EmployerSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-[#10152A] text-white fixed left-0 top-0 pt-16 z-40">
      {navItems.map(item => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
            pathname === item.href.split('?')[0]
              ? 'bg-[#57C7E3]/20 text-[#57C7E3] border-r-2 border-[#57C7E3]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </aside>
  )
}
