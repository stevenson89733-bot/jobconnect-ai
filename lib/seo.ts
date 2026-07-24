// Single source for the production origin used in metadata/OG tags and the
// sitemap — falls back to the real canonical production domain
// (jobconnect-ai.com, not the jobconnect-ai.vercel.app Vercel subdomain) so
// metadata is still correct in a build that hasn't set NEXT_PUBLIC_SITE_URL
// explicitly.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jobconnect-ai.com').replace(/\/$/, '')

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
