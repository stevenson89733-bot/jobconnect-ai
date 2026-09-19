'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Users, BarChart2, UserCircle, PlusCircle } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/recruiter',          icon: LayoutDashboard },
  { label: 'Post a Job',  href: '/recruiter?post=1',   icon: PlusCircle },
  { label: 'Candidates',  href: '/candidates',         icon: Users },
  { label: 'Analytics',   href: '/recruiter',          icon: BarChart2, matchExact: true },
  { label: 'Profile',     href: '/recruiter/profile',  icon: UserCircle },
]

export default function EmployerSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  function isActive(href: string, matchExact?: boolean) {
    const path = href.split('?')[0]
    if (matchExact) return pathname === path
    return pathname === path || (!matchExact && pathname.startsWith(path) && path !== '/recruiter')
      || (path === '/recruiter' && pathname === '/recruiter')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-[#10152A] text-white transition-all duration-200 ${
          collapsed ? 'w-[64px]' : 'w-[220px]'
        } sticky top-16 h-[calc(100vh-4rem)] self-start`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'gap-2'}`}>
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-tight text-white truncate">
              JobConnect <span className="text-[#57C7E3]">AI</span>
            </span>
          )}
          {collapsed && <span className="text-[#57C7E3] font-bold text-lg">J</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon, matchExact }) => {
            const active = isActive(href, matchExact)
            return (
              <Link
                key={label}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium rounded-lg mx-2 transition-colors ${
                  active
                    ? 'bg-[#57C7E3]/20 text-[#57C7E3]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors self-center mb-4"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-slate-400 text-xs">{collapsed ? '→' : '←'}</span>
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#10152A] border-t border-white/10 flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.filter((_, i) => i !== 3).map(({ label, href, icon: Icon, matchExact }) => {
          const active = isActive(href, matchExact)
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active ? 'text-[#57C7E3]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.75} />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
