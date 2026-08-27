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

vi.mock('@/lib/arbeitnow', () => ({
  fetchArbeitnowJobs: vi.fn().mockResolvedValue([
    {
      slug: 'senior-engineer-acme',
      company_name: 'Acme Corp',
      title: 'Senior Engineer',
      description: 'Great remote job.',
      remote: true,
      tags: ['typescript', 'react'],
      job_types: ['full_time'],
      location: 'Worldwide',
      created_at: 1700000000,
      url: 'https://arbeitnow.com/jobs/senior-engineer-acme',
    },
  ]),
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

describe('GET /api/admin/arbeitnow-jobs', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 401 when user is not signed in', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockReturnValue(makeSupabase({ user: null, isAdmin: null }) as never)

    const { GET } = await import('@/app/api/admin/arbeitnow-jobs/route')
    const req = new Request('http://localhost/api/admin/arbeitnow-jobs')
    const res = await GET(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('mustBeSignedIn')
  })

  it('returns 403 for a non-admin employer', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockReturnValue(makeSupabase({ user: { id: 'emp-1' }, isAdmin: false }) as never)

    const { GET } = await import('@/app/api/admin/arbeitnow-jobs/route')
    const req = new Request('http://localhost/api/admin/arbeitnow-jobs')
    const res = await GET(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toBe('adminsOnly')
  })

  it('returns 403 for a non-admin candidate', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockReturnValue(makeSupabase({ user: { id: 'cand-1' }, isAdmin: false }) as never)

    const { GET } = await import('@/app/api/admin/arbeitnow-jobs/route')
    const req = new Request('http://localhost/api/admin/arbeitnow-jobs')
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns 200 with jobs for an admin', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockReturnValue(makeSupabase({ user: { id: 'admin-1' }, isAdmin: true }) as never)

    const { GET } = await import('@/app/api/admin/arbeitnow-jobs/route')
    const req = new Request('http://localhost/api/admin/arbeitnow-jobs')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.jobs)).toBe(true)
    expect(json.jobs[0].slug).toBe('senior-engineer-acme')
  })
})
