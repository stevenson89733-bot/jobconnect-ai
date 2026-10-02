"use client";
// components/landing/LandingNav.tsx
import { useState } from "react";
import Link from "next/link";
import { Icon } from "./LandingIcons";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CountrySelector from "@/components/country/CountrySelector";
import { signOut } from "@/app/actions/auth";
import NotificationBell from "@/components/notifications/NotificationBell";

interface LandingNavProps {
  userEmail?: string | null;
  isAdmin?: boolean;
}

function JobConnectLogo() {
  return (
    <svg
      width="auto"
      height="42"
      viewBox="0 0 338 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="JobConnect AI"
      style={{ display: "block" }}
    >
      {/* C — orange filled arc */}
      <path d="M58 12 A29 29 0 1 0 58 64 L52 57 A20 20 0 1 1 52 19 Z" fill="#F0663A" />
      {/* J crossbar */}
      <rect x="28" y="8" width="22" height="10" rx="4" fill="#1a2e5a" />
      {/* J stem */}
      <rect x="34" y="8" width="10" height="40" rx="2.5" fill="#1a2e5a" />
      {/* J hook */}
      <path d="M34 48 Q34 63 23 63 Q15 63 14 57 L20 55 Q21 58 23 58 Q28 58 28 48 Z" fill="#1a2e5a" />
      {/* Person head */}
      <circle cx="46" cy="40" r="4.5" fill="#F0663A" />
      {/* Person shoulders */}
      <path d="M38 54 Q42 48 46 46 Q50 48 54 54" stroke="#1a2e5a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* JobConnect text */}
      <text x="78" y="50" fontFamily="'Montserrat', 'Inter', system-ui, sans-serif" fontWeight="800" fontSize="34" letterSpacing="-0.5" fill="currentColor">JobConnect</text>
      {/* AI text */}
      <text x="326" y="50" fontFamily="'Montserrat', 'Inter', system-ui, sans-serif" fontWeight="900" fontSize="34" letterSpacing="-0.5" fill="#F0663A">AI</text>
      {/* Tagline */}
      <text x="79" y="65" fontFamily="'Inter', system-ui, sans-serif" fontWeight="600" fontSize="6.5" letterSpacing="1.0" fill="#F0663A">CONNECTING TALENT. BUILDING FUTURES.</text>
    </svg>
  );
}

export function LandingNav({ userEmail, isAdmin }: LandingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="landing-topbar">
      <Link className="landing-brand" href="/" aria-label="JobConnect AI">
        <JobConnectLogo />
      </Link>

      {/* Desktop nav */}
      <nav className="landing-nav-links" aria-label="Main navigation">
        {/* Browse Jobs */}
        <div className="landing-nav-dropdown">
          <Link href="/jobs" className="landing-nav-item">
            Jobs
            <svg className="landing-nav-chevron" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
          <div className="landing-mega-menu">
            <div className="landing-mega-col">
              <p className="landing-mega-label">Job Categories</p>
              {[["Engineering","Engineering"],["Marketing","Marketing"],["Design","Design"],["Sales","Sales"],["Data Science","Data"],["Finance","Finance"],["HR & Recruiting","HR"]].map(([label, val]) => (
                <Link key={val} href={`/jobs?category=${encodeURIComponent(val)}`} className="landing-mega-link">{label}</Link>
              ))}
              <Link href="/jobs" className="landing-mega-link landing-mega-link--accent">All categories →</Link>
            </div>
            <div className="landing-mega-col">
              <p className="landing-mega-label">Job Locations</p>
              {[["🇺🇸 USA","US"],["🇫🇷 France","FR"],["🇩🇪 Germany","DE"],["🇬🇧 UK","GB"],["🇨🇦 Canada","CA"],["🌍 Global Remote","worldwide"]].map(([label, val]) => (
                <Link key={val} href={`/jobs?country=${val}`} className="landing-mega-link">{label}</Link>
              ))}
              <Link href="/jobs" className="landing-mega-link landing-mega-link--accent">All locations →</Link>
            </div>
            <div className="landing-mega-col">
              <p className="landing-mega-label">Job Types</p>
              {[["Remote Full-time","Full-time"],["Remote Part-time","Part-time"],["Contract","Contract"],["Freelance","Contract"]].map(([label, val]) => (
                <Link key={label} href={`/jobs?type=${encodeURIComponent(val)}`} className="landing-mega-link">{label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* AI Tools */}
        <div className="landing-nav-dropdown">
          <Link href="/ai-tools" className="landing-nav-item">
            <span className="landing-nav-accent">✦</span> AI Tools
            <svg className="landing-nav-chevron" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
          <div className="landing-dropdown-menu">
            {[
              ["/ai-tools/resume-builder","📄","Resume Builder","AI-optimized for every role"],
              ["/ai-tools/cover-letter","✉️","Cover Letter","Tailored to each application"],
              ["/ai-tools/interview-prep","🎤","Interview Prep","Practice with AI feedback"],
              ["/ai-tools/linkedin-optimizer","🔗","LinkedIn Optimizer","Stand out to recruiters"],
              ["/ai-tools/skill-gap","🧭","Skill Gap Analysis","Know what to learn next"],
              ["/ai-tools/cv-builder","📋","CV Builder","Professional CV in minutes"],
            ].map(([href, emoji, title, desc]) => (
              <Link key={href as string} href={href as string} className="landing-dropdown-item">
                <span className="landing-dropdown-emoji">{emoji}</span>
                <span>
                  <span className="landing-dropdown-title">{title}</span>
                  <span className="landing-dropdown-desc">{desc}</span>
                </span>
              </Link>
            ))}
            <div className="landing-dropdown-divider" />
            <Link href="/auto-apply" className="landing-dropdown-item">
              <span className="landing-dropdown-emoji">🤖</span>
              <span>
                <span className="landing-dropdown-title">
                  Auto-Apply
                  <span className="landing-pro-badge">Pro</span>
                </span>
                <span className="landing-dropdown-desc">AI applies to jobs for you daily</span>
              </span>
            </Link>
            <Link href="/pricing" className="landing-dropdown-item">
              <span className="landing-dropdown-emoji">✨</span>
              <span>
                <span className="landing-dropdown-title">
                  AI Job Match
                  <span className="landing-pro-badge">Pro</span>
                </span>
                <span className="landing-dropdown-desc">AI-ranked jobs tailored to you</span>
              </span>
            </Link>
            <Link href="/pricing" className="landing-dropdown-item">
              <span className="landing-dropdown-emoji">🔔</span>
              <span>
                <span className="landing-dropdown-title">
                  Interview Alerts
                  <span className="landing-pro-badge">Pro</span>
                </span>
                <span className="landing-dropdown-desc">Never miss a callback</span>
              </span>
            </Link>
            <div className="landing-dropdown-divider" />
            <Link href="/pricing" className="landing-dropdown-item landing-dropdown-item--cta">
              <span className="landing-dropdown-emoji">🔒</span>
              <span>
                <span className="landing-dropdown-title">See all Pro plans →</span>
                <span className="landing-dropdown-desc">Elite from $39.99/mo · Pro from $19.99/mo</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Pricing */}
        <Link href="/pricing" className="landing-nav-item">Pricing</Link>
      </nav>

      {/* Right actions */}
      <div className="landing-header-actions">
        <LanguageSwitcher />
        <CountrySelector />
        <ThemeToggle />

        {userEmail ? (
          <>
            <NotificationBell />
            <Link href="/dashboard" className="landing-text-btn">Dashboard</Link>
            <Link href="/profile" className="landing-text-btn">Profile</Link>
            {isAdmin && (
              <Link href="/admin" className="landing-text-btn landing-text-btn--admin">🛡️ Admin</Link>
            )}
            <form action={signOut} style={{ display: "inline" }}>
              <button type="submit" className="landing-outline-btn">Sign out</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="landing-text-btn">Log in</Link>
            <Link href="/register" className="landing-primary-btn landing-primary-btn--small">
              Get started <Icon name="arrow" size={16} />
            </Link>
          </>
        )}

        <button
          className="landing-menu-btn"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name="menu" size={20} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="landing-mobile-menu">
          <Link href="/jobs" onClick={() => setMenuOpen(false)}>Browse Jobs</Link>
          <Link href="/ai-tools" onClick={() => setMenuOpen(false)}>✦ AI Tools</Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
          <div className="landing-mobile-divider" />
          {userEmail ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)}>🛡️ Admin</Link>}
              <form action={signOut}><button type="submit">Sign out</button></form>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link href="/register" className="landing-primary-btn" onClick={() => setMenuOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
