import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-intl/server before importing the route
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

// Mock lib/rateLimit
vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn().mockReturnValue({ ok: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

// Mock lib/ai/parseRssFeed
vi.mock('@/lib/ai/parseRssFeed', () => ({
  fetchAndParseRssFeed: vi.fn().mockResolvedValue([
    { title: 'Sr Engineer', link: 'https://example.com/1', description: 'Job desc', pubDate: '2024-01-01', guid: '1' },
  ]),
  WE_WORK_REMOTELY_RSS_URL: 'https://weworkremotely.com/remote-jobs.rss',
}))

// Supabase mock — shape set per test in beforeEach
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

// Import the route handler AFTER all mocks are in place
const { GET } = await import('@/app/api/ai/rss-jobs/route')

function makeRequest() {
  return new Request('http://localhost/api/ai/rss-jobs')
}

describe('GET /api/ai/rss-jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('returns 200 with jobs for an admin', async () => {
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
  })
})
