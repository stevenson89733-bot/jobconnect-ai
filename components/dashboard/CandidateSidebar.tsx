'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function CandidateSidebar() {
  const t = useTranslations('candidate')
  const pathname = usePathname()

  const navItems = [
    { label: t('navDashboard'), href: '/candidate', icon: '🏠' },
    { label: t('navJobs'), href: '/jobs', icon: '💼' },
    { label: t('navApplications'), href: '/candidate/applications', icon: '📋' },
    { label: t('navAiTools'), href: '/ai-tools/resume-builder', icon: '🤖' },
    { label: t('navProfile'), href: '/profile', icon: '👤' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-[#10152A] text-white fixed left-0 top-0 pt-16 z-40">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
            pathname === item.href
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
