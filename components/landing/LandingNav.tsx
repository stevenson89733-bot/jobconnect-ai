"use client";
// components/landing/LandingNav.tsx
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
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

export function LandingNav({ userEmail, isAdmin }: LandingNavProps) {
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="landing-topbar">
      <Link className="landing-brand" href="/" aria-label="JobConnect AI">
        <Image
          src="/icon-jc.svg"
          alt=""
          width={38}
          height={38}
          priority
          className="landing-logo-icon"
          aria-hidden="true"
        />
        <span className="landing-logo-text">
          <span className="landing-logo-wordmark">
            <span className="landing-logo-job">Job</span>
            <span className="landing-logo-connect">Connect</span>
            <span className="landing-logo-ai">AI</span>
          </span>
          <span className="landing-logo-tagline">{t("tagline")}</span>
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="landing-nav-links" aria-label="Main navigation">
        {/* Jobs */}
        <div className="landing-nav-dropdown">
          <Link href="/jobs" className="landing-nav-item">
            {t("jobs")}
            <svg className="landing-nav-chevron" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
          <div className="landing-mega-menu">
            <div className="landing-mega-col">
              <p className="landing-mega-label">{t("jobCategories")}</p>
              {([
                [t("catEngineering"), "Engineering"],
                [t("catMarketing"),   "Marketing"],
                [t("catDesign"),      "Design"],
                [t("catSales"),       "Sales"],
                [t("catDataScience"), "Data"],
                [t("catFinance"),     "Finance"],
                [t("catHr"),          "HR"],
              ] as [string, string][]).map(([label, val]) => (
                <Link key={val} href={`/jobs?category=${encodeURIComponent(val)}`} className="landing-mega-link">{label}</Link>
              ))}
              <Link href="/jobs" className="landing-mega-link landing-mega-link--accent">{t("allCategories")}</Link>
            </div>
            <div className="landing-mega-col">
              <p className="landing-mega-label">{t("jobLocations")}</p>
              {[
                ["🇺🇸 USA",          "US"],
                ["🇫🇷 France",       "FR"],
                ["🇩🇪 Germany",      "DE"],
                ["🇬🇧 UK",           "GB"],
                ["🇨🇦 Canada",       "CA"],
                ["🌍 Global Remote", "worldwide"],
              ].map(([label, val]) => (
                <Link key={val} href={`/jobs?country=${val}`} className="landing-mega-link">{label}</Link>
              ))}
              <Link href="/jobs" className="landing-mega-link landing-mega-link--accent">{t("allLocations")}</Link>
            </div>
            <div className="landing-mega-col">
              <p className="landing-mega-label">{t("jobTypes")}</p>
              {([
                [t("typeRemoteFullTime"), "Full-time"],
                [t("typeRemotePartTime"), "Part-time"],
                [t("typeContract"),       "Contract"],
                [t("typeFreelance"),      "Contract"],
              ] as [string, string][]).map(([label, val]) => (
                <Link key={label} href={`/jobs?type=${encodeURIComponent(val)}`} className="landing-mega-link">{label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* AI Tools */}
        <div className="landing-nav-dropdown">
          <Link href="/ai-tools" className="landing-nav-item">
            <span className="landing-nav-accent">✦</span> {t("aiTools")}
            <svg className="landing-nav-chevron" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
          <div className="landing-dropdown-menu">
            {([
              ["/ai-tools/resume-builder", "📄", t("resumeBuilder"),      t("navResumeBuilderDesc")],
              ["/ai-tools/cover-letter",   "✉️", t("coverLetter"),        t("navCoverLetterDesc")],
              ["/ai-tools/interview-prep", "🎤", t("interviewPrep"),      t("interviewPrepDesc")],
              ["/ai-tools/linkedin-optimizer","🔗",t("linkedinOptimizer"),t("linkedinOptimizerDesc")],
              ["/ai-tools/skill-gap",      "🧭", t("skillGap"),           t("skillGapDesc")],
              ["/ai-tools/cv-builder",     "📋", t("cvBuilder"),          t("cvBuilderDesc")],
            ] as [string, string, string, string][]).map(([href, emoji, title, desc]) => (
              <Link key={href} href={href} className="landing-dropdown-item">
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
                  {t("autoApply")}
                  <span className="landing-pro-badge">Pro</span>
                </span>
                <span className="landing-dropdown-desc">{t("autoApplyDesc")}</span>
              </span>
            </Link>
            <Link href="/pricing" className="landing-dropdown-item">
              <span className="landing-dropdown-emoji">✨</span>
              <span>
                <span className="landing-dropdown-title">
                  {t("aiJobMatch")}
                  <span className="landing-pro-badge">Pro</span>
                </span>
                <span className="landing-dropdown-desc">{t("aiJobMatchDesc")}</span>
              </span>
            </Link>
            <Link href="/pricing" className="landing-dropdown-item">
              <span className="landing-dropdown-emoji">🔔</span>
              <span>
                <span className="landing-dropdown-title">
                  {t("interviewAlerts")}
                  <span className="landing-pro-badge">Pro</span>
                </span>
                <span className="landing-dropdown-desc">{t("interviewAlertsDesc")}</span>
              </span>
            </Link>
            <div className="landing-dropdown-divider" />
            <Link href="/pricing" className="landing-dropdown-item landing-dropdown-item--cta">
              <span className="landing-dropdown-emoji">🔒</span>
              <span>
                <span className="landing-dropdown-title">{t("seeAllProPlans")}</span>
                <span className="landing-dropdown-desc">{t("proPlansDesc")}</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Pricing */}
        <Link href="/pricing" className="landing-nav-item">{t("pricing")}</Link>
      </nav>

      {/* Right actions */}
      <div className="landing-header-actions">
        <LanguageSwitcher />
        <CountrySelector />
        <ThemeToggle />

        {userEmail ? (
          <>
            <NotificationBell />
            <Link href="/dashboard" className="landing-text-btn">{t("dashboard")}</Link>
            <Link href="/profile" className="landing-text-btn">{t("profile")}</Link>
            {isAdmin && (
              <Link href="/admin" className="landing-text-btn landing-text-btn--admin">🛡️ {t("admin")}</Link>
            )}
            <form action={signOut} style={{ display: "inline" }}>
              <button type="submit" className="landing-outline-btn">{t("signOut")}</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="landing-text-btn">{t("logIn")}</Link>
            <Link href="/register" className="landing-primary-btn landing-primary-btn--small">
              {t("getStarted")} <Icon name="arrow" size={16} />
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
          <Link href="/jobs" onClick={() => setMenuOpen(false)}>{t("browseJobs")}</Link>
          <Link href="/ai-tools" onClick={() => setMenuOpen(false)}>✦ {t("aiTools")}</Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)}>{t("pricing")}</Link>
          <div className="landing-mobile-divider" />
          {userEmail ? (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>{t("dashboard")}</Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>{t("profile")}</Link>
              {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)}>🛡️ {t("admin")}</Link>}
              <form action={signOut}><button type="submit">{t("signOut")}</button></form>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>{t("logIn")}</Link>
              <Link href="/register" className="landing-primary-btn" onClick={() => setMenuOpen(false)}>{t("getStarted")}</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
