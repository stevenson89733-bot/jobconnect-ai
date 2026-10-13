import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fakeSupabase, filter, type Call, type Result } from '../helpers/fakeSupabase'

vi.mock('@vercel/analytics/server', () => ({ track: vi.fn().mockResolvedValue(undefined) }))

const { attributeReferralAtSignup, recordFirstJobMatch, recordReturnVisit, recordReferralEvent, getOrCreateReferralCode } =
  await import('@/lib/referral/server')

const REFERRER = '11111111-1111-4111-8111-111111111111'
const REFERRED = '22222222-2222-4222-8222-222222222222'
const VISIT = '33333333-3333-4333-8333-333333333333'
const ATTR = '44444444-4444-4444-8444-444444444444'
const NOW = new Date('2026-10-13T12:00:00Z')
const DAY = 24 * 60 * 60 * 1000
const daysAgo = (d: number) => new Date(NOW.getTime() - d * DAY).toISOString()

const inserts = (calls: Call[], table: string) => calls.filter((c) => c.table === table && c.op === 'insert')
const updates = (calls: Call[], table: string) => calls.filter((c) => c.table === table && c.op === 'update')
const events = (calls: Call[]) => inserts(calls, 'referral_events').map((c) => (c.payload as { event_name: string }).event_name)

/** Happy-path DB for attributeReferralAtSignup; `over` lets a test change one answer. */
function signupDb(over: Partial<Record<string, Result>> = {}) {
  return fakeSupabase((call) => {
    if (call.table === 'referral_visits' && call.op === 'select')
      return over.visit ?? { data: { id: VISIT, code: 'K7M2QX9P', referrer_user_id: REFERRER, created_at: daysAgo(3) } }
    if (call.table === 'referral_codes' && call.op === 'select')
      return over.code ?? { data: { user_id: REFERRER, disabled_at: null } }
    if (call.table === 'referral_attributions' && call.op === 'insert')
      return over.insert ?? { data: { id: ATTR } }
    if (call.table === 'referral_attributions' && call.op === 'select') return { count: 0 }
    if (call.table === 'referral_events' && call.op === 'select') return { count: 0 }
    return {}
  })
}

describe('attributeReferralAtSignup', () => {
  it('attributes a valid, in-window visit and emits referral_signup_completed', async () => {
    const db = signupDb()
    const res = await attributeReferralAtSignup(db.client, { newUserId: REFERRED, visitId: VISIT, signupIpHash: 'h', now: NOW })
    expect(res).toEqual({ attributed: true })
    const [ins] = inserts(db.calls, 'referral_attributions')
    expect(ins.payload).toMatchObject({ referrer_user_id: REFERRER, referred_user_id: REFERRED, code: 'K7M2QX9P', visit_id: VISIT })
    expect(events(db.calls)).toEqual(['referral_signup_completed'])
  })

  it.each([
    ['missing cookie', undefined],
    ['malformed cookie', 'not-a-uuid'],
  ])('ignores %s without touching the DB', async (_l, visitId) => {
    const db = signupDb()
    const res = await attributeReferralAtSignup(db.client, { newUserId: REFERRED, visitId, signupIpHash: null, now: NOW })
    expect(res.attributed).toBe(false)
    expect(db.calls).toHaveLength(0)
  })

  it('ignores an unknown visit id', async () => {
    const db = signupDb({ visit: { data: null } })
    expect((await attributeReferralAtSignup(db.client, { newUserId: REFERRED, visitId: VISIT, signupIpHash: null, now: NOW })).reason).toBe('unknown_visit')
    expect(inserts(db.calls, 'referral_attributions')).toHaveLength(0)
  })

  it('ignores visits older than 30 days (server clock)', async () => {
    const db = signupDb({ visit: { data: { id: VISIT, code: 'K7M2QX9P', referrer_user_id: REFERRER, created_at: daysAgo(31) } } })
    expect((await attributeReferralAtSignup(db.client, { newUserId: REFERRED, visitId: VISIT, signupIpHash: null, now: NOW })).reason).toBe('expired')
    expect(inserts(db.calls, 'referral_attributions')).toHaveLength(0)
  })

  it('prevents self-referral', async () => {
    const db = signupDb({ visit: { data: { id: VISIT, code: 'K7M2QX9P', referrer_user_id: REFERRED, created_at: daysAgo(1) } } })
    expect((await attributeReferralAtSignup(db.client, { newUserId: REFERRED, visitId: VISIT, signupIpHash: null, now: NOW })).reason).toBe('self')
    expect(inserts(db.calls, 'referral_attributions')).toHaveLength(0)
  })

  it('ignores disabled codes and codes whose owner no longer matches the visit', async () => {
    for (const code of [{ data: { user_id: REFERRER, disabled_at: daysAgo(1) } }, { data: { user_id: REFERRED, disabled_at: null } }, { data: null }]) {
      const db = signupDb({ code })
      expect((await attributeReferralAtSignup(db.client, { newUserId: REFERRED, visitId: VISIT, signupIpHash: null, now: NOW })).reason).toBe('invalid_code')
      expect(inserts(db.calls, 'referral_attributions')).toHaveLength(0)
    }
  })

  it('never overwrites an existing attribution (unique violation → no event)', async () => {
    const db = signupDb({ insert: { error: { code: '23505', message: 'duplicate' } } })
    const res = await attributeReferralAtSignup(db.client, { newUserId: REFERRED, visitId: VISIT, signupIpHash: null, now: NOW })
    expect(res).toEqual({ attributed: false, reason: 'duplicate' })
    expect(updates(db.calls, 'referral_attributions')).toHaveLength(0)
    expect(events(db.calls)).toEqual([])
  })

  it('flags (but keeps) a signup from the same network as the referrer', async () => {
    const db = fakeSupabase((call) => {
      if (call.table === 'referral_visits') return { data: { id: VISIT, code: 'K7M2QX9P', referrer_user_id: REFERRER, created_at: daysAgo(1) } }
      if (call.table === 'referral_codes') return { data: { user_id: REFERRER, disabled_at: null } }
      if (call.table === 'referral_attributions' && call.op === 'insert') return { data: { id: ATTR } }
      if (call.table === 'referral_events' && call.op === 'select') return { count: 1 }
      return { count: 0 }
    })
    const res = await attributeReferralAtSignup(db.client, { newUserId: REFERRED, visitId: VISIT, signupIpHash: 'same', now: NOW })
    expect(res.attributed).toBe(true)
    const [flag] = updates(db.calls, 'referral_attributions')
    expect(flag.payload).toMatchObject({ flagged_reason: 'same_ip_as_referrer' })
    expect(events(db.calls)).toEqual(['referral_signup_completed', 'referral_abuse_flagged'])
  })
})

describe('recordFirstJobMatch (qualifying action)', () => {
  function matchDb(opts: { firstMatchAt: string | null; firstUpdateRows: number; activatedRows: number }) {
    return fakeSupabase((call) => {
      if (call.table === 'referral_codes' && call.op === 'select')
        return { data: { code: 'K7M2QX9P', first_job_match_at: opts.firstMatchAt, prompt_dismissed_until: null, disabled_at: null } }
      if (call.table === 'referral_codes' && call.op === 'update')
        return { data: Array.from({ length: opts.firstUpdateRows }, () => ({ user_id: REFERRED })) }
      if (call.table === 'referral_attributions' && call.op === 'update')
        return { data: Array.from({ length: opts.activatedRows }, () => ({ id: ATTR })) }
      return {}
    })
  }

  it('first match: marks first_job_match_at and activates the referred user once', async () => {
    const db = matchDb({ firstMatchAt: null, firstUpdateRows: 1, activatedRows: 1 })
    expect(await recordFirstJobMatch(db.client, REFERRED)).toEqual({ isFirstMatch: true })
    const [act] = updates(db.calls, 'referral_attributions')
    expect(filter(act, 'referred_user_id')).toBe(REFERRED)
    expect(act.filters).toContainEqual(['activated_at', 'is', null]) // idempotent guard
    expect(events(db.calls)).toEqual(['referral_user_activated'])
    const [ev] = inserts(db.calls, 'referral_events')
    expect((ev.payload as { dedupe_key: string }).dedupe_key).toBe(`activated:${ATTR}`)
  })

  it('later matches: no prompt, no second activation event', async () => {
    const db = matchDb({ firstMatchAt: daysAgo(2), firstUpdateRows: 0, activatedRows: 0 })
    expect(await recordFirstJobMatch(db.client, REFERRED)).toEqual({ isFirstMatch: false })
    expect(updates(db.calls, 'referral_codes')).toHaveLength(0)
    expect(events(db.calls)).toEqual([])
  })

  it('non-referred user: unlocks own prompt, no activation event', async () => {
    const db = matchDb({ firstMatchAt: null, firstUpdateRows: 1, activatedRows: 0 })
    expect(await recordFirstJobMatch(db.client, REFERRED)).toEqual({ isFirstMatch: true })
    expect(events(db.calls)).toEqual([])
  })

  it('never writes to referral_rewards (rewards disabled)', async () => {
    const db = matchDb({ firstMatchAt: null, firstUpdateRows: 1, activatedRows: 1 })
    await recordFirstJobMatch(db.client, REFERRED)
    expect(db.calls.some((c) => c.table === 'referral_rewards')).toBe(false)
  })
})

describe('recordReturnVisit (day 7..30)', () => {
  function returnDb(registeredAt: string, returned: string | null) {
    return fakeSupabase((call) => {
      if (call.table === 'referral_attributions' && call.op === 'select')
        return { data: { id: ATTR, registered_at: registeredAt, returned_7d_at: returned } }
      if (call.table === 'referral_attributions' && call.op === 'update') return { data: [{ id: ATTR }] }
      return {}
    })
  }

  it('records the return once inside the window', async () => {
    const db = returnDb(daysAgo(8), null)
    expect(await recordReturnVisit(db.client, REFERRED, NOW)).toBe(true)
    expect(updates(db.calls, 'referral_attributions')).toHaveLength(1)
    expect(events(db.calls)).toEqual(['referral_user_returned_7d'])
  })

  it.each([
    ['before day 7', daysAgo(3), null],
    ['after day 30', daysAgo(31), null],
    ['already recorded', daysAgo(10), daysAgo(1)],
  ])('does nothing %s', async (_l, reg, returned) => {
    const db = returnDb(reg, returned)
    expect(await recordReturnVisit(db.client, REFERRED, NOW)).toBe(false)
    expect(updates(db.calls, 'referral_attributions')).toHaveLength(0)
  })
})

describe('recordReferralEvent', () => {
  beforeEach(() => vi.clearAllMocks())

  it('treats a duplicate dedupe_key as a silent no-op', async () => {
    const db = fakeSupabase(() => ({ error: { code: '23505', message: 'dup' } }))
    expect(await recordReferralEvent(db.client, { name: 'referral_user_activated', dedupeKey: 'activated:x' })).toBe(false)
  })

  it('mirrors only channel/reason to Vercel Analytics — no ids or hashes', async () => {
    const { track } = await import('@vercel/analytics/server')
    const db = fakeSupabase(() => ({}))
    await recordReferralEvent(db.client, {
      name: 'referral_link_copied',
      userId: REFERRER,
      metadata: { channel: 'copy', ip_hash: 'secret-hash' },
    })
    expect(track).toHaveBeenCalledWith('referral_link_copied', { channel: 'copy' })
  })
})

describe('getOrCreateReferralCode', () => {
  it('retries on a random-code collision', async () => {
    let selects = 0
    let insertsN = 0
    const db = fakeSupabase((call) => {
      if (call.op === 'select') {
        selects++
        return selects < 3 ? { data: null } : { data: { code: 'ABCDEFGH', first_job_match_at: null, prompt_dismissed_until: null, disabled_at: null } }
      }
      insertsN++
      return insertsN === 1 ? { error: { code: '23505', message: 'code taken' } } : {}
    })
    const row = await getOrCreateReferralCode(db.client, REFERRER)
    expect(row?.code).toBe('ABCDEFGH')
    expect(insertsN).toBe(2)
  })
})
