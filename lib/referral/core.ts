import { randomInt, createHash } from 'crypto'

// Pure, dependency-free referral helpers — everything here is unit-tested
// in isolation (__tests__/lib/referral.test.ts). Server-only (node:crypto).

export const REFERRAL_COOKIE = 'jcai_ref_visit'
export const REFERRAL_WINDOW_DAYS = 30
export const ATTRIBUTION_WINDOW_MS = REFERRAL_WINDOW_DAYS * 24 * 60 * 60 * 1000
export const REFERRAL_COOKIE_MAX_AGE = REFERRAL_WINDOW_DAYS * 24 * 60 * 60 // seconds
export const RETURN_MIN_DAYS = 7
export const RETURN_MAX_DAYS = 30
export const PROMPT_SNOOZE_DAYS = 14

const DAY_MS = 24 * 60 * 60 * 1000

// Unambiguous base32: no 0/O, 1/I. Must match the CHECK constraint in
// supabase/migrations/20261013_referral_system.sql.
export const REFERRAL_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
export const REFERRAL_CODE_LENGTH = 8
const CODE_RE = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** CSPRNG code — never derived from the user id. */
export function generateReferralCode(): string {
  let out = ''
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
    out += REFERRAL_CODE_ALPHABET[randomInt(REFERRAL_CODE_ALPHABET.length)]
  }
  return out
}

/** Uppercases and validates untrusted input; returns null when malformed. */
export function normalizeReferralCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const code = raw.trim().toUpperCase()
  return CODE_RE.test(code) ? code : null
}

export function isUuid(raw: unknown): raw is string {
  return typeof raw === 'string' && UUID_RE.test(raw)
}

/** Is a visit recorded at `visitedAt` still inside the attribution window at `now`? */
export function isWithinAttributionWindow(visitedAt: string | Date, now: Date = new Date()): boolean {
  const t = new Date(visitedAt).getTime()
  if (Number.isNaN(t)) return false
  const age = now.getTime() - t
  return age >= 0 && age <= ATTRIBUTION_WINDOW_MS
}

/** Whole days elapsed since `from` (fractional days rounded down). */
export function daysSince(from: string | Date, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(from).getTime()) / DAY_MS)
}

/** Day 7..30 after signup counts as the "7-day return". */
export function isInReturnWindow(registeredAt: string | Date, now: Date = new Date()): boolean {
  const t = new Date(registeredAt).getTime()
  if (Number.isNaN(t)) return false
  const age = now.getTime() - t
  return age >= RETURN_MIN_DAYS * DAY_MS && age <= RETURN_MAX_DAYS * DAY_MS
}

/**
 * Salted SHA-256 of the caller IP — raw IPs are never stored. Salt comes from
 * REFERRAL_IP_SALT, falling back to (a hash of) the service-role key so no
 * new env var is strictly required.
 */
export function hashIp(ip: string): string | null {
  if (!ip || ip === 'unknown') return null
  const salt = process.env.REFERRAL_IP_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

/** Rewards stay off unless the owner explicitly sets REFERRAL_REWARDS_ENABLED=true. */
export function isReferralRewardsEnabled(): boolean {
  return process.env.REFERRAL_REWARDS_ENABLED === 'true'
}

export function buildReferralUrl(code: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://jobconnect-ai.com').replace(/\/$/, '')
  return `${base}/?ref=${code}`
}

// Client-reportable events → the event name stored in referral_events
// (must match its CHECK constraint). 'referral_share_started' is accepted as
// an alias of the stored 'referral_share_initiated'. Everything else is
// emitted server-side only.
export const CLIENT_EVENTS = {
  referral_prompt_viewed: 'referral_prompt_viewed',
  referral_prompt_dismissed: 'referral_prompt_dismissed',
  referral_link_copied: 'referral_link_copied',
  referral_share_initiated: 'referral_share_initiated',
  referral_share_started: 'referral_share_initiated',
} as const
export type ClientEventKey = keyof typeof CLIENT_EVENTS

export function toClientEvent(raw: unknown): (typeof CLIENT_EVENTS)[ClientEventKey] | null {
  return typeof raw === 'string' && Object.prototype.hasOwnProperty.call(CLIENT_EVENTS, raw)
    ? CLIENT_EVENTS[raw as ClientEventKey]
    : null
}

export const SHARE_CHANNELS = ['copy', 'native', 'whatsapp', 'linkedin', 'email'] as const
export type ShareChannel = typeof SHARE_CHANNELS[number]

export function isShareChannel(v: unknown): v is ShareChannel {
  return typeof v === 'string' && (SHARE_CHANNELS as readonly string[]).includes(v)
}

// Abuse thresholds — flag only, never block (except self-referral).
export const ABUSE_VISITS_SAME_IP_CODE_24H = 5
export const ABUSE_SAME_IP_SIGNUPS_24H = 3
export const ABUSE_REFERRER_SIGNUPS_24H = 10
