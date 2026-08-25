import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn().mockReturnValue({ ok: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/lib/ai/jobExtract', () => ({
  extractJobFromText: vi.fn().mockResolvedValue({ title: 'Engineer', company_name: 'Acme' }),
  hasEnoughText: vi.fn().mockReturnValue(true),
  JobExtractError: class JobExtractError extends Error {
    status: number
    constructor(msg: string, status: number) { super(msg); this.status = status }
  },
}))

vi.mock('@/lib/ai/fetchJobUrl', () => ({
  fetchJobUrl: vi.fn().mockResolvedValue('Full job description from URL'),
}))

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

const { POST } = await import('@/app/api/ai/extract-job/route')

function makeRequest(body: object = { text: 'A '.repeat(60) }) {
  return new Request('http://localhost/api/ai/extract-job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai/extract-job', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 403 for a regular employer (non-admin)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'employer-uuid' } } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { is_admin: false }, error: null }),
    })
    const res = await POST(makeRequest())
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
    const res = await POST(makeRequest())
    expect(res.status).toBe(403)
  })

  it('returns 200 with extracted fields for an admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-uuid' } } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { is_admin: true }, error: null }),
    })
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.extracted).toBeDefined()
  })
})
