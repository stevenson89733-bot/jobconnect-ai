import Link from 'next/link'
import { ArrowRight, Users, Star, Ticket, Radio } from 'lucide-react'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createClient } from '@supabase/supabase-js'

type UserRow = {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
  employer_plan: string | null
  candidate_plan: string | null
  is_premium: boolean | null
  created_at: string
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function safeStat<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn() } catch { return fallback }
}

async function fetchStats() {
  const supa = db()

  const [totalUsers, premiumUsers, promos, activeOutreach] = await Promise.all([
    safeStat(async () => {
      const { count } = await supa.from('profiles').select('*', { count: 'exact', head: true })
      return count ?? 0
    }, 0),
    safeStat(async () => {
      const { count } = await supa.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true)
      return count ?? 0
    }, 0),
    safeStat(async () => {
      const { data } = await supa.from('promo_codes').select('used_count')
      return (data ?? []).reduce((s, r) => s + (r.used_count ?? 0), 0)
    }, 0),
    safeStat(async () => {
      const { count } = await supa.from('outreach_contacts').select('*', { count: 'exact', head: true })
        .not('status', 'in', '(converted,not_interested)')
      return count ?? 0
    }, 0),
  ])

  return { totalUsers, premiumUsers, promoUsed: promos, activeOutreach }
}

async function fetchUsers(): Promise<UserRow[]> {
  try {
    const { data } = await db()
      .from('profiles')
      .select('id, email, full_name, role, employer_plan, candidate_plan, is_premium, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    return (data as UserRow[] | null) ?? []
  } catch {
    return []
  }
}

const PLAN_BADGE: Record<string, string> = {
  free:       'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  pro:        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  elite:      'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  growth:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  enterprise: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

function PlanBadge({ plan }: { plan: string | null }) {
  const label = plan ?? 'free'
  const cls = PLAN_BADGE[label] ?? PLAN_BADGE.free
  return (
    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}

const STATS = [
  { key: 'totalUsers',     label: 'Total Users',        icon: Users,  color: 'text-blue-500' },
  { key: 'premiumUsers',   label: 'Premium Users',      icon: Star,   color: 'text-violet-500' },
  { key: 'promoUsed',      label: 'Promo Codes Used',   icon: Ticket, color: 'text-amber-500' },
  { key: 'activeOutreach', label: 'Active Outreach',    icon: Radio,  color: 'text-green-500' },
] as const

const CARDS = [
  {
    href:        '/admin/reviews',
    emoji:       '🛡️',
    title:       'Job Reviews',
    description: 'Moderate and approve job postings',
    accent:      {
      border: 'group-hover:border-blue-500/60 dark:group-hover:border-blue-400/60',
      icon:   'bg-blue-50 dark:bg-blue-900/30',
      arrow:  'group-hover:text-blue-500 dark:group-hover:text-blue-400',
    },
  },
  {
    href:        '/admin/promo-codes',
    emoji:       '🎟️',
    title:       'Promo Codes',
    description: 'Create and manage early-access promo codes',
    accent:      {
      border: 'group-hover:border-violet-500/60 dark:group-hover:border-violet-400/60',
      icon:   'bg-violet-50 dark:bg-violet-900/30',
      arrow:  'group-hover:text-violet-500 dark:group-hover:text-violet-400',
    },
  },
  {
    href:        '/admin/outreach',
    emoji:       '📊',
    title:       'Outreach Tracker',
    description: 'Pipeline kanban for LinkedIn / WhatsApp early adopters',
    accent:      {
      border: 'group-hover:border-green-500/60 dark:group-hover:border-green-400/60',
      icon:   'bg-green-50 dark:bg-green-900/30',
      arrow:  'group-hover:text-green-500 dark:group-hover:text-green-400',
    },
  },
]

export default async function AdminPage() {
  const isAdmin = await requireAdmin('/admin')
  if (!isAdmin) {
    return (
      <section className="py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white">Not authorized</h2>
        <p className="text-slate-600 dark:text-slate-400">You need admin privileges to access this page.</p>
      </section>
    )
  }

  const [stats, users] = await Promise.all([fetchStats(), fetchUsers()])

  return (
    <section className="max-w-5xl mx-auto py-10 px-6">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Panel</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Platform management and moderation tools.</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {STATS.map(s => {
          const Icon = s.icon
          const value = stats[s.key]
          return (
            <div
              key={s.key}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 flex flex-col gap-3 shadow-sm"
            >
              <Icon size={18} className={s.color} />
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                  {value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-tight">{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Cards ── */}
      <div className="grid sm:grid-cols-3 gap-4">
        {CARDS.map(c => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg transition-all duration-200 ${c.accent.border}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${c.accent.icon} transition-colors`}>
              {c.emoji}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-base text-slate-900 dark:text-white mb-1">{c.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{c.description}</p>
            </div>
            <div className={`flex justify-end text-slate-300 dark:text-slate-600 ${c.accent.arrow} transition-colors`}>
              <ArrowRight size={18} />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Users & Plans ── */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          👥 Users &amp; Plans ({stats.totalUsers} total)
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Employer Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Candidate Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Premium</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No users found</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {u.full_name ?? <span className="text-slate-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {u.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PlanBadge plan={u.role} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PlanBadge plan={u.employer_plan} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PlanBadge plan={u.candidate_plan} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {u.is_premium
                      ? <span className="text-green-600 dark:text-green-400 font-semibold">✓</span>
                      : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  )
}
