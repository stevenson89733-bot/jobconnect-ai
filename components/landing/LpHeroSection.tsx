"use client";
// components/landing/LpHeroSection.tsx
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "./LandingIcons";

const JOB_MATCHES = [
  { company: "NORTHSTAR", role: "Senior Product Designer", meta: "Remote · Europe", score: 96, color: "violet" },
  { company: "APERTURE", role: "Frontend Engineer", meta: "Remote · Worldwide", score: 91, color: "cyan" },
  { company: "HORIZON", role: "Growth Marketing Lead", meta: "Toronto · Hybrid", score: 87, color: "orange" },
] as const;

export function LpHeroSection() {
  const t = useTranslations("landing");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>(t("filterBestMatch"));

  const FILTERS = [
    t("filterBestMatch"),
    t("filterRemote"),
    t("filterVisaSupport"),
    t("filterNewToday"),
  ];

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("country", location.trim());
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <section className="landing-hero" id="jobs">
      <div className="landing-hero-glow landing-hero-glow--1" aria-hidden="true" />
      <div className="landing-hero-glow landing-hero-glow--2" aria-hidden="true" />

      <div className="landing-hero-inner">
        {/* ── left: copy + search ── */}
        <div className="landing-hero-content">
          <div className="landing-eyebrow">
            <Icon name="sparkles" size={15} />
            {t("eyebrow")}
          </div>

          <h1 className="landing-hero-h1">
            {t("h1Part1")}{" "}
            <span>{t("h1Span")}</span>
          </h1>

          <p className="landing-hero-copy">{t("copy")}</p>

          <form className="landing-search-panel" onSubmit={handleSearch}>
            <label className="landing-search-field">
              <Icon name="search" size={18} />
              <span className="landing-search-field-inner">
                <small className="landing-search-label">{t("searchLabelWhat")}</small>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholderWhat")}
                />
              </span>
            </label>
            <label className="landing-search-field">
              <Icon name="globe" size={18} />
              <span className="landing-search-field-inner">
                <small className="landing-search-label">{t("searchLabelWhere")}</small>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("searchPlaceholderWhere")}
                />
              </span>
            </label>
            <button className="landing-match-btn" type="submit">
              <Icon name="sparkles" size={15} /> {t("searchBtn")}
            </button>
          </form>

          <div className="landing-hero-proof">
            <div className="landing-avatar-stack" aria-hidden="true">
              <span>AK</span>
              <span>MS</span>
              <span>JL</span>
              <span>+</span>
            </div>
            <div className="landing-proof-text">
              <strong>{t("proofCount")}</strong>
              <span>{t("proofText")}</span>
            </div>
            <div className="landing-proof-divider" aria-hidden="true" />
            <div className="landing-rating">
              <strong>4.9</strong>
              <span className="landing-rating-stars" aria-label="5 stars">★★★★★</span>
            </div>
          </div>
        </div>

        {/* ── right: dashboard preview ── */}
        <div className="landing-dashboard" aria-label="Job match preview">
          <div className="landing-preview-head">
            <div>
              <span className="landing-window-dot" />
              <span className="landing-window-dot" />
              <span className="landing-window-dot" />
            </div>
            <span>{t("dashboardTitle")}</span>
            <button aria-label="More options" type="button">•••</button>
          </div>

          <div className="landing-preview-body">
            <div className="landing-profile-strip">
              <div className="landing-profile-avatar">AM</div>
              <div className="landing-profile-info">
                <strong>{t("dashboardGreeting")}</strong>
                <span>{t("dashboardNewRoles")}</span>
              </div>
              <span className="landing-live-badge">
                <i aria-hidden="true" /> {t("dashboardLiveBadge")}
              </span>
            </div>

            <div className="landing-filter-row">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`landing-filter-btn${activeFilter === f ? " active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f === t("filterBestMatch") && <Icon name="sparkles" size={13} />}
                  {f}
                </button>
              ))}
            </div>

            <div className="landing-match-list">
              {JOB_MATCHES.map((job) => (
                <article className="landing-job-row" key={job.role}>
                  <div className={`landing-company-logo landing-company-logo--${job.color}`}>
                    {job.company.charAt(0)}
                  </div>
                  <div className="landing-job-details">
                    <span>{job.company}</span>
                    <strong>{job.role}</strong>
                    <small>{job.meta}</small>
                  </div>
                  <div className="landing-job-score">
                    <strong>{job.score}%</strong>
                    <span>{t("matchLabel")}</span>
                  </div>
                  <button type="button" className="landing-job-action" aria-label={`View ${job.role}`}>
                    <Icon name="chevron" size={17} />
                  </button>
                </article>
              ))}
            </div>

            <div className="landing-preview-footer">
              <span>
                <Icon name="check" size={14} /> {t("updatedProfile")}
              </span>
              <button type="button">
                {t("seeAllMatches")} <Icon name="arrow" size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
