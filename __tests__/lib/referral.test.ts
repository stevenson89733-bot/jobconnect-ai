import { describe, it, expect, afterEach } from 'vitest'
import {
  generateReferralCode,
  normalizeReferralCode,
  isUuid,
  isWithinAttributionWindow,
  isInReturnWindow,
  hashIp,
  isReferralRewardsEnabled,
  buildReferralUrl,
  isShareChannel,
  toClientEvent,
  daysSince,
  REFERRAL_COOKIE,
  REFERRAL_COOKIE_MAX_AGE,
  ATTRIBUTION_WINDOW_MS,
} from '@/lib/referral/core'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-10-13T12:00:00Z')
const ago = (days: number) => new Date(NOW.getTime() - days * DAY)

describe('generateReferralCode', () => {
  it('matches the DB CHECK format (8 chars, unambiguous alphabet)', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateReferralCode()).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/)
    }
  })

  it('is effectively unique across many draws', () => {
    const codes = new Set(Array.from({ length: 5000 }, generateReferralCode))
    expect(codes.size).toBe(5000)
  })
})

describe('normalizeReferralCode', () => {
  it('accepts valid codes, case-insensitively and trimmed', () => {
    expect(normalizeReferralCode('K7M2QX9P')).toBe('K7M2QX9P')
    expect(normalizeReferralCode('  k7m2qx9p ')).toBe('K7M2QX9P')
  })

  it.each([
    ['too short', 'K7M2QX9'],
    ['too long', 'K7M2QX9PA'],
    ['ambiguous 0', 'K7M2QX90'],
    ['ambiguous O', 'K7M2QXOP'],
    ['ambiguous 1', 'K7M2QX1P'],
    ['ambiguous I', 'K7M2QXIP'],
    ['symbols', "K7M2';--"],
    ['empty', ''],
  ])('rejects malformed input (%s)', (_label, raw) => {
    expect(normalizeReferralCode(raw)).toBeNull()
  })

  it('rejects non-strings', () => {
    expect(normalizeReferralCode(undefined)).toBeNull()
    expect(normalizeReferralCode(12345678)).toBeNull()
    expect(normalizeReferralCode({ code: 'K7M2QX9P' })).toBeNull()
  })
})

describe('isUuid', () => {
  it('only accepts UUIDs', () => {
    expect(isUuid('6f1c1c0e-7f3a-4b8e-9a54-0a1b2c3d4e5f')).toBe(true)
    expect(isUuid('not-a-uuid')).toBe(false)
    expect(isUuid(undefined)).toBe(false)
  })
})

describe('attribution window (30 days)', () => {
  it('accepts visits inside the window', () => {
    expect(isWithinAttributionWindow(ago(0), NOW)).toBe(true)
    expect(isWithinAttributionWindow(ago(29.9), NOW)).toBe(true)
  })
  it('rejects expired, future-dated and invalid timestamps', () => {
    expect(isWithinAttributionWindow(ago(30.1), NOW)).toBe(false)
    expect(isWithinAttributionWindow(ago(-1), NOW)).toBe(false)
    expect(isWithinAttributionWindow('garbage', NOW)).toBe(false)
  })
})

describe('return window (day 7..30)', () => {
  it('only counts visits between day 7 and day 30 after signup', () => {
    expect(isInReturnWindow(ago(6.9), NOW)).toBe(false)
    expect(isInReturnWindow(ago(7), NOW)).toBe(true)
    expect(isInReturnWindow(ago(30), NOW)).toBe(true)
    expect(isInReturnWindow(ago(30.1), NOW)).toBe(false)
  })
})

describe('hashIp', () => {
  afterEach(() => { delete process.env.REFERRAL_IP_SALT })

  it('never returns the raw IP and is stable for the same salt', () => {
    process.env.REFERRAL_IP_SALT = 'salt-a'
    const h = hashIp('203.0.113.7')
    expect(h).toMatch(/^[0-9a-f]{64}$/)
    expect(h).not.toContain('203.0.113.7')
    expect(hashIp('203.0.113.7')).toBe(h)
    process.env.REFERRAL_IP_SALT = 'salt-b'
    expect(hashIp('203.0.113.7')).not.toBe(h)
  })

  it('returns null for unknown IPs', () => {
    expect(hashIp('unknown')).toBeNull()
    expect(hashIp('')).toBeNull()
  })
})

describe('config', () => {
  afterEach(() => { delete process.env.REFERRAL_REWARDS_ENABLED })

  it('rewards are disabled unless explicitly set to "true"', () => {
    expect(isReferralRewardsEnabled()).toBe(false)
    process.env.REFERRAL_REWARDS_ENABLED = '1'
    expect(isReferralRewardsEnabled()).toBe(false)
    process.env.REFERRAL_REWARDS_ENABLED = 'true'
    expect(isReferralRewardsEnabled()).toBe(true)
  })

  it('builds a ?ref= URL with no user identifiers', () => {
    expect(buildReferralUrl('K7M2QX9P')).toMatch(/\/\?ref=K7M2QX9P$/)
  })

  it('cookie + window constants', () => {
    expect(REFERRAL_COOKIE).toBe('jcai_ref_visit')
    expect(REFERRAL_COOKIE_MAX_AGE).toBe(30 * 24 * 60 * 60)
    expect(ATTRIBUTION_WINDOW_MS).toBe(30 * DAY)
  })

  it('daysSince floors whole days', () => {
    expect(daysSince(ago(7.9), NOW)).toBe(7)
    expect(daysSince(ago(0.5), NOW)).toBe(0)
  })

  it('maps only whitelisted client events to stored DB names', () => {
    expect(toClientEvent('referral_link_copied')).toBe('referral_link_copied')
    expect(toClientEvent('referral_share_started')).toBe('referral_share_initiated')
    expect(toClientEvent('referral_prompt_dismissed')).toBe('referral_prompt_dismissed')
    expect(toClientEvent('referral_user_activated')).toBeNull()
    expect(toClientEvent('referral_signup_completed')).toBeNull()
    expect(toClientEvent('toString')).toBeNull()
    expect(toClientEvent(42)).toBeNull()
  })

  it('whitelists share channels', () => {
    expect(isShareChannel('whatsapp')).toBe(true)
    expect(isShareChannel('sms')).toBe(false)
  })
})
