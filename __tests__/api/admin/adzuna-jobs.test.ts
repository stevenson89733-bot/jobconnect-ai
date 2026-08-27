import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn().mockReturnValue({ ok: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/adzuna', () => ({
  ADZUNA_COUNTRIES: [
    { code: 'gb', label: 'UK' },
    { code: 'au', label: 'Australia' },
    { code: 'fr', label: 'France' },
    { code: 'de', label: 'Germany' },
    { code: 'ca', label: 'Canada' },
    { code: 'nl', label: 'Netherlands' },
  ],
  fetchAdzunaJobs: vi.fn().mockResolvedValue([
    {
      id: '123456',
      title: 'Remote Backend Engineer',
      company_name: 'Beta Ltd',
      description: 'Node.js role.',
      location: 'London, UK',
      salary_min: 60000,
      salary_max: 80000,
      redirect_url: 'https://adzuna.co.uk/jobs/123456',
      created: '2026-08-20T12:00:00Z',
      country: 'gb',
    },
  ]),
  adzunaSourceKey: (c: string) => `adzuna_${c}`,
  formatAdzunaSalary: vi.fn(),
}))

const makeSupabase = ({
  user,
  isAdmin,
}: {
  user: { id: string } | null
  isAdmin: boolean | null
}) => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user } }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: isAdmin !== null ? { is_admin: isAdmin } : null }),
  }),
})

describe('GET /api/admin/adzuna-jobs', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 401 when user is not signed in', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockReturnValue(makeSupabase({ user: null, isAdmin: null }) as never)

    const { GET } = await import('@/app/api/admin/adzuna-jobs/route')
    const req = new Request('http://localhost/api/admin/adzuna-jobs?country=gb')
    const res = await GET(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('mustBeSignedIn')
  })

  it('returns 403 for a non-admin employer', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockReturnValue(makeSupabase({ user: { id: 'emp-1' }, isAdmin: false }) as never)

    const { GET } = await import('@/app/api/admin/adzuna-jobs/route')
    const req = new Request('http://localhost/api/admin/adzuna-jobs?country=gb')
    const res = await GET(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toBe('adminsOnly')
  })

  it('returns 403 for a non-admin candidate', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockReturnValue(makeSupabase({ user: { id: 'cand-1' }, isAdmin: false }) as never)

    const { GET } = await import('@/app/api/admin/adzuna-jobs/route')
    const req = new Request('http://localhost/api/admin/adzuna-jobs?country=gb')
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns 400 for an invalid country', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockReturnValue(makeSupabase({ user: { id: 'admin-1' }, isAdmin: true }) as never)

    const { GET } = await import('@/app/api/admin/adzuna-jobs/route')
    const req = new Request('http://localhost/api/admin/adzuna-jobs?country=us')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with jobs for an admin', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockReturnValue(makeSupabase({ user: { id: 'admin-1' }, isAdmin: true }) as never)

    const { GET } = await import('@/app/api/admin/adzuna-jobs/route')
    const req = new Request('http://localhost/api/admin/adzuna-jobs?country=gb')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.jobs)).toBe(true)
    expect(json.jobs[0].id).toBe('123456')
  })
})
