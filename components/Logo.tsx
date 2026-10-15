import Image from 'next/image'

/**
 * JobConnect AI brand lockup — the same mark + HTML wordmark as LandingNav,
 * shared by the footers so the logo is identical everywhere.
 * - Mark: /logo-mark.png (JC + person, transparent, 4x for HiDPI), 36px
 *   tall, never blended — readable on white and on the #0c1830 navy.
 * - Wordmark: HTML spans styled by styles/landing.css (.landing-logo-*),
 *   so "Job" flips to white in dark mode instead of disappearing like the
 *   old full-logo PNG did.
 * Server-safe (no hooks); wrap it in a <Link> at the call site.
 */
export default function Logo({ tagline }: { tagline?: string }) {
  return (
    <span className="landing-brand">
      <Image
        src="/logo-mark.png"
        alt=""
        width={43}
        height={36}
        className="landing-logo-icon"
        aria-hidden="true"
      />
      <span className="landing-logo-text">
        <span className="landing-logo-wordmark">
          <span className="landing-logo-job">Job</span>
          <span className="landing-logo-connect">Connect</span>
          <span className="landing-logo-ai">AI</span>
        </span>
        {tagline && <span className="landing-logo-tagline">{tagline}</span>}
      </span>
    </span>
  )
}
