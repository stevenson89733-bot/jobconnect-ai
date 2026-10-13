import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fakeSupabase, type Call } from '../helpers/fakeSupabase'

// Route-level authorization, input validation and visit-flow rules for /api/referral/*.

vi.mock('@vercel/analytics/server', () => ({ track: vi.fn().mockResolvedValue(undefined) }))
const mockRateLimit = vi.fn().mockReturnValue({ ok: true })
vi.mock('@/lib/rateLimit', () => ({
  rateLimit: (...a: unknown[]) => mockRateLimit(...a),
  getClientIp: vi.fn().mockReturnValue('203.0.113.7'),
}))

const mockCookieGet = vi.fn()
vi.mock('next/headers', () => ({ cookies: () => ({ get: mockCookieGet }), headers: () => new Headers() }))

const mockGetUser = vi.fn()
const mockProfileRole = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockProfileRole() }) }) }) }),
  }),
}))

let admin: { client: { from: unknown }; calls: Call[] } | null = null
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => {
    if (!admin) throw new Error('admin client must not be reached in this test')
    return admin.client
  },
}))

const me = await import('@/app/api/referral/me/route')
const event = await import('@/app/api/referral/event/route')
const visit = await import('@/app/api/referral/visit/route')
const dismiss = await import('@/app/api/referral/dismiss/route')
const ret = await import('@/app/api/referral/return/route')

const post = (body: unknown) =>
  new Request('http://localhost/api/referral/x', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) })
const signedOut = () => mockGetUser.mockResolvedValue({ data: { user: null } })
const signedIn = (id = 'u1') => mockGetUser.mockResolvedValue({ data: { user: { id } } })
const eventNames = (calls: Call[]) =>
  calls.filter((c) => c.table === 'referral_events' && c.op === 'insert').map((c) => (c.payload as { event_name: string }).event_name)

beforeEach(() => {
  vi.clearAllMocks()
  mockRateLimit.mockReturnValue({ ok: true })
  mockCookieGet.mockReturnValue(undefined)
  admin = null
})

describe('auth required (401 when signed out)', () => {
  it.each([
    ['GET /me', () => me.GET()],
    ['POST /event', () => event.POST(post({ event: 'referral_link_copied' }))],
    ['POST /dismiss', () => dismiss.POST()],
    ['POST /return', () => ret.POST()],
  ])('%s', async (_l, call) => {
    signedOut()
    expect((await call()).status).toBe(401)
  })
})

describe('GET /api/referral/me', () => {
  it('403 for employers/recruiters (candidates only)', async () => {
    signedIn()
    mockProfileRole.mockReturnValue({ role: 'employer' })
    expect((await me.GET()).status).toBe(403)
  })
})

describe('POST /api/referral/event', () => {
  it.each([
    ['server-only event forged by client', { event: 'referral_signup_completed' }],
    ['activation forged by client', { event: 'referral_user_activated' }],
    ['short legacy key', { event: 'link_copied' }],
    ['prototype key', { event: 'toString' }],
    ['unknown channel', { event: 'referral_share_started', channel: 'sms' }],
    ['missing event', {}],
    ['malformed JSON', '{not json'],
  ])('400 for %s', async (_l, body) => {
    signedIn()
    expect((await event.POST(post(body))).status).toBe(400)
  })

  it('403 when the user has no referral code (e.g. recruiter)', async () => {
    signedIn()
    admin = fakeSupabase(() => ({ data: null }))
    expect((await event.POST(post({ event: 'referral_link_copied', channel: 'copy' }))).status).toBe(403)
  })

  it('stores referral_share_started under the DB name referral_share_initiated', async () => {
    signedIn()
    admin = fakeSupabase((c) => (c.table === 'referral_codes' ? { data: { user_id: 'u1' } } : {}))
    expect((await event.POST(post({ event: 'referral_share_started', channel: 'whatsapp' }))).status).toBe(200)
    expect(eventNames(admin.calls)).toEqual(['referral_share_initiated'])
  })

  it('is rate-limited to 20/min per user', async () => {
    signedIn()
    mockRateLimit.mockReturnValue({ ok: false })
    expect((await event.POST(post({ event: 'referral_link_copied' }))).status).toBe(429)
    expect(mockRateLimit).toHaveBeenCalledWith('referral-event:u1', 20, 60_000)
  })
})

describe('POST /api/referral/dismiss', () => {
  it('snoozes the prompt for 14 days and records the event', async () => {
    signedIn()
    admin = fakeSupabase((c) => (c.table === 'referral_codes' ? { data: [{ user_id: 'u1' }] } : {}))
    const res = await dismiss.POST()
    expect(res.status).toBe(200)
    const upd = admin.calls.find((c) => c.table === 'referral_codes' && c.op === 'update')!
    const until = new Date((upd.payload as { prompt_dismissed_until: string }).prompt_dismissed_until).getTime()
    expect(until - Date.now()).toBeGreaterThan(13.9 * 24 * 3600 * 1000)
    expect(upd.filters).toContainEqual(['user_id', 'eq', 'u1']) // own row only
    expect(eventNames(admin.calls)).toEqual(['referral_prompt_dismissed'])
  })

  it('403 when the user has no referral code', async () => {
    signedIn()
    admin = fakeSupabase(() => ({ data: [] }))
    expect((await dismiss.POST()).status).toBe(403)
  })
})

describe('POST /api/referral/return', () => {
  it('does not record outside day 7..30 (server-side check)', async () => {
    signedIn()
    admin = fakeSupabase((c) =>
      c.op === 'select' ? { data: { id: 'a1', registered_at: new Date(Date.now() - 2 * 86400_000).toISOString(), returned_7d_at: null } } : {}
    )
    const res = await ret.POST()
    expect(await res.json()).toEqual({ ok: true, recorded: false })
    expect(admin.calls.some((c) => c.op === 'update')).toBe(false)
  })
})

describe('POST /api/referral/visit', () => {
  it.each([
    ['malformed code', { code: "x'; drop table--" }],
    ['missing code', {}],
    ['malformed JSON', '{oops'],
  ])('answers neutrally without DB access for %s', async (_l, body) => {
    const res = await visit.POST(post(body))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('is rate-limited to 30/hour per IP', async () => {
    mockRateLimit.mockReturnValue({ ok: false })
    expect((await visit.POST(post({ code: 'K7M2QX9P' }))).status).toBe(429)
    expect(mockRateLimit).toHaveBeenCalledWith('referral-visit-ip:203.0.113.7', 30, 3_600_000)
  })

  it('skips signed-in users (they cannot be referred)', async () => {
    signedIn()
    const res = await visit.POST(post({ code: 'K7M2QX9P' }))
    expect(await res.json()).toEqual({ ok: true })
  })

  it('unknown or disabled code → neutral, no cookie, no visit row', async () => {
    for (const row of [null, { user_id: 'ref', disabled_at: '2026-01-01' }]) {
      signedOut()
      admin = fakeSupabase(() => ({ data: row }))
      const res = await visit.POST(post({ code: 'K7M2QX9P' }))
      expect(await res.json()).toEqual({ ok: true })
      expect(res.headers.get('set-cookie')).toBeNull()
      expect(admin.calls.some((c) => c.op === 'insert')).toBe(false)
    }
  })

  it('valid code → visit row + httpOnly jcai_ref_visit cookie holding the visit id', async () => {
    signedOut()
    admin = fakeSupabase((c) => {
      if (c.table === 'referral_codes') return { data: { user_id: 'ref', disabled_at: null } }
      if (c.table === 'referral_visits' && c.op === 'insert') return { data: { id: 'visit-123' } }
      if (c.table === 'referral_visits') return { count: 1 }
      return {}
    })
    const res = await visit.POST(post({ code: 'k7m2qx9p' }))
    const cookie = res.headers.get('set-cookie') ?? ''
    expect(cookie).toContain('jcai_ref_visit=visit-123')
    expect(cookie.toLowerCase()).toContain('httponly')
    expect(eventNames(admin.calls)).toEqual(['referral_link_visited'])
  })

  it('flags >5 visits from the same IP+code in 24h (flag only, still neutral)', async () => {
    signedOut()
    admin = fakeSupabase((c) => {
      if (c.table === 'referral_codes') return { data: { user_id: 'ref', disabled_at: null } }
      if (c.table === 'referral_visits' && c.op === 'insert') return { data: { id: 'visit-9' } }
      if (c.table === 'referral_visits') return { count: 6 }
      return {}
    })
    const res = await visit.POST(post({ code: 'K7M2QX9P' }))
    expect(await res.json()).toEqual({ ok: true })
    expect(eventNames(admin.calls)).toEqual(['referral_link_visited', 'referral_abuse_flagged'])
  })

  it('keeps an existing valid attribution cookie (first-touch, no overwrite)', async () => {
    signedOut()
    mockCookieGet.mockReturnValue({ value: '33333333-3333-4333-8333-333333333333' })
    admin = fakeSupabase((c) =>
      c.table === 'referral_codes' ? { data: { user_id: 'ref', disabled_at: null } } : { data: { created_at: new Date().toISOString() } }
    )
    const res = await visit.POST(post({ code: 'K7M2QX9P' }))
    expect(await res.json()).toEqual({ ok: true })
    expect(res.headers.get('set-cookie')).toBeNull()
    expect(admin.calls.some((c) => c.op === 'insert')).toBe(false)
  })
})
