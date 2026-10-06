'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function EmployerSidebar() {
  const t = useTranslations('recruiter')
  const pathname = usePathname()

  const navItems = [
    { label: t('navDashboard'),  href: '/employer/dashboard' },
    { label: t('navRecruiter'),  href: '/recruiter' },
    { label: t('navPostAJob'),   href: '/recruiter?post=true' },
    { label: t('navCandidates'), href: '/recruiter' },
    { label: t('navProfile'),    href: '/recruiter/profile' },
  ]

  const icons = ['📊', '🏠', '➕', '👥', '🏢']

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-[#10152A] text-white fixed left-0 top-0 pt-16 z-40">
      {navItems.map((item, i) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
            pathname === item.href.split('?')[0]
              ? 'bg-[#57C7E3]/20 text-[#57C7E3] border-r-2 border-[#57C7E3]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>{icons[i]}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </aside>
  )
}
