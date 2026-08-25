import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn().mockReturnValue({ ok: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/lib/remotive', () => ({
  fetchRemotiveJobs: vi.fn().mockResolvedValue([
    { id: 1, title: 'Senior Engineer', company_name: 'Acme', category: 'Software Development', tags: ['typescript'], job_type: 'full_time', publication_date: '2026-08-01', candidate_required_location: 'Worldwide', salary: '$120k', description: 'Great role.', url: 'https://remotive.com/job/1' },
  ]),
}))

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

const { GET } = await import('@/app/api/admin/remotive-jobs/route')

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/admin/remotive-jobs')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new Request(url.toString())
}

describe('GET /api/admin/remotive-jobs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 403 for a regular employer (non-admin)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'employer-uuid' } } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { is_admin: false }, error: null }),
    })
    const res = await GET(makeRequest())
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('adminsOnly')
  })

  it('returns 403 for a candidate (non-admin)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'candidate-uuid' } } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { is_admin: false }, error: null }),
    })
    const res = await GET(makeRequest())
    expect(res.status).toBe(403)
  })

  it('returns 200 with jobs array for an admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-uuid' } } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { is_admin: true }, error: null }),
    })
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.jobs)).toBe(true)
    expect(body.jobs[0].title).toBe('Senior Engineer')
  })
})
