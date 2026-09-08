import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JobConnect AI — Remote Jobs for Vietnam-Based Professionals',
}

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --ink: #0F1A14; --ink-soft: #3D5247; --bg: #F0F5F1; --bg-card: #FFFFFF;
  --accent: #1A6641; --accent-light: #E3F0E9; --accent-gold: #C8932A;
  --border: #D4E2D8; --radius: 6px;
}
body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--ink); line-height: 1.6; -webkit-font-smoothing: antialiased; }
nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 48px; background: var(--bg); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
.logo { font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 18px; color: var(--ink); text-decoration: none; }
.logo span { color: var(--accent); }
.nav-cta { background: var(--accent); color: #fff; padding: 10px 22px; border-radius: var(--radius); text-decoration: none; font-weight: 500; font-size: 14px; }
.hero { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; max-width: 1100px; margin: 0 auto; padding: 80px 48px 64px; }
.hero-flag { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: var(--accent); background: var(--accent-light); padding: 6px 14px; border-radius: 20px; margin-bottom: 24px; }
.hero h1 { font-family: 'DM Serif Display', serif; font-size: clamp(36px, 4.5vw, 54px); line-height: 1.15; color: var(--ink); margin-bottom: 20px; }
.hero h1 em { font-style: italic; color: var(--accent); }
.hero-sub { font-size: 17px; color: var(--ink-soft); max-width: 460px; margin-bottom: 36px; line-height: 1.65; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-primary { background: var(--accent); color: #fff; padding: 14px 28px; border-radius: var(--radius); text-decoration: none; font-weight: 600; font-size: 15px; }
.btn-secondary { background: transparent; color: var(--accent); padding: 14px 28px; border-radius: var(--radius); border: 1.5px solid var(--accent); text-decoration: none; font-weight: 500; font-size: 15px; }
.hero-visual { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,.06); }
.match-label { font-size: 11px; font-weight: 600; letter-spacing: .04em; color: var(--ink-soft); margin-bottom: 16px; text-transform: uppercase; }
.job-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
.job-card:last-child { margin-bottom: 0; }
.job-card-left { flex: 1; }
.job-title { font-weight: 600; font-size: 14px; color: var(--ink); }
.job-company { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
.job-tags { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.tag { font-size: 11px; padding: 3px 8px; border-radius: 4px; background: var(--accent-light); color: var(--accent); font-weight: 500; }
.match-score { font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--accent); margin-left: 16px; white-space: nowrap; text-align: center; }
.match-score span { font-family: 'DM Sans', sans-serif; font-size: 11px; color: var(--ink-soft); display: block; }
.stats { background: var(--accent); padding: 40px 48px; }
.stats-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; text-align: center; }
.stat-num { font-family: 'DM Serif Display', serif; font-size: 42px; color: #fff; line-height: 1; }
.stat-label { font-size: 14px; color: rgba(255,255,255,.75); margin-top: 6px; }
.features { max-width: 1100px; margin: 0 auto; padding: 80px 48px; }
.section-label { font-size: 13px; font-weight: 600; color: var(--accent-gold); margin-bottom: 12px; }
.section-title { font-family: 'DM Serif Display', serif; font-size: clamp(28px, 3vw, 40px); color: var(--ink); margin-bottom: 48px; max-width: 520px; line-height: 1.2; }
.features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.feature-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 28px; }
.feature-icon { width: 40px; height: 40px; background: var(--accent-light); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 20px; }
.feature-title { font-weight: 600; font-size: 16px; margin-bottom: 8px; }
.feature-desc { font-size: 14px; color: var(--ink-soft); line-height: 1.6; }
.trust { background: var(--ink); padding: 72px 48px; text-align: center; }
.trust-inner { max-width: 640px; margin: 0 auto; }
.trust-quote { font-family: 'DM Serif Display', serif; font-size: clamp(22px, 2.5vw, 30px); color: #fff; line-height: 1.4; margin-bottom: 24px; font-style: italic; }
.trust-name { font-size: 14px; color: rgba(255,255,255,.6); }
.cta-bottom { max-width: 1100px; margin: 0 auto; padding: 80px 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
.cta-bottom h2 { font-family: 'DM Serif Display', serif; font-size: clamp(28px, 3vw, 40px); line-height: 1.2; margin-bottom: 16px; }
.cta-bottom p { font-size: 16px; color: var(--ink-soft); margin-bottom: 32px; }
.promo-box { background: var(--accent-light); border: 1.5px dashed var(--accent); border-radius: var(--radius); padding: 20px 24px; font-size: 14px; color: var(--accent); font-weight: 500; }
.promo-code { font-size: 20px; font-weight: 700; letter-spacing: .05em; display: block; margin-top: 4px; }
footer { border-top: 1px solid var(--border); padding: 24px 48px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--ink-soft); }
@media (max-width: 768px) {
  nav { padding: 16px 20px; }
  .hero { grid-template-columns: 1fr; padding: 48px 20px; gap: 32px; }
  .hero-visual { display: none; }
  .stats { padding: 32px 20px; }
  .stats-inner { grid-template-columns: 1fr; gap: 20px; }
  .features { padding: 48px 20px; }
  .features-grid { grid-template-columns: 1fr; }
  .cta-bottom { grid-template-columns: 1fr; padding: 48px 20px; }
  footer { flex-direction: column; gap: 8px; text-align: center; padding: 20px; }
}
`

export default function LpVietnamPage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav>
        <a className="logo" href="https://jobconnect-ai.com">JobConnect <span>AI</span></a>
        <a className="nav-cta" href="https://jobconnect-ai.com/register">Get Started Free</a>
      </nav>

      <section className="hero">
        <div>
          <div className="hero-flag">🇻🇳 For professionals based in Vietnam</div>
          <h1>Remote jobs that <em>find you</em>, wherever you are.</h1>
          <p className="hero-sub">Working from Hà Nội, TP.HCM, or Đà Nẵng? JobConnect AI matches your skills to verified remote roles worldwide — and helps you apply in seconds.</p>
          <div className="hero-actions">
            <a className="btn-primary" href="https://jobconnect-ai.com/register">Find Remote Jobs</a>
            <a className="btn-secondary" href="https://jobconnect-ai.com/jobs">Browse Openings</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="match-label">Top matches for you</div>
          <div className="job-card">
            <div className="job-card-left">
              <div className="job-title">Senior Product Designer</div>
              <div className="job-company">Figma · Worldwide Remote</div>
              <div className="job-tags">
                <span className="tag">True Remote</span>
                <span className="tag">$90k–120k</span>
              </div>
            </div>
            <div className="match-score">92%<span>match</span></div>
          </div>
          <div className="job-card">
            <div className="job-card-left">
              <div className="job-title">Growth Marketing Lead</div>
              <div className="job-company">Notion · Cross-border</div>
              <div className="job-tags">
                <span className="tag">Diaspora Friendly</span>
                <span className="tag">$70k–95k</span>
              </div>
            </div>
            <div className="match-score">87%<span>match</span></div>
          </div>
          <div className="job-card">
            <div className="job-card-left">
              <div className="job-title">Full-Stack Engineer</div>
              <div className="job-company">Vercel · Worldwide Remote</div>
              <div className="job-tags">
                <span className="tag">True Remote</span>
                <span className="tag">$110k+</span>
              </div>
            </div>
            <div className="match-score">84%<span>match</span></div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stats-inner">
          <div>
            <div className="stat-num">10k+</div>
            <div className="stat-label">Verified remote jobs</div>
          </div>
          <div>
            <div className="stat-num">190+</div>
            <div className="stat-label">Countries supported</div>
          </div>
          <div>
            <div className="stat-num">60s</div>
            <div className="stat-label">To apply with AI</div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-label">What JobConnect AI does</div>
        <div className="section-title">Built for professionals who work across borders</div>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <div className="feature-title">AI Match Score</div>
            <div className="feature-desc">Every job gets a match percentage based on your skills, experience, and location flexibility — so you focus on roles you can actually get.</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📄</div>
            <div className="feature-title">ATS Resume Builder</div>
            <div className="feature-desc">Generate a tailored, ATS-optimized CV for any role in seconds. Includes a 0–100 score and keyword suggestions powered by GPT-4o.</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">✉️</div>
            <div className="feature-title">Apply with AI</div>
            <div className="feature-desc">One click generates a personalized cover letter and adapted CV — both downloadable as PDF, ready to send immediately.</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤖</div>
            <div className="feature-title">Auto-Apply</div>
            <div className="feature-desc">Upload your CV once. JobConnect AI matches you to new jobs daily and sends personalized applications on your behalf.</div>
          </div>
        </div>
      </section>

      <section className="trust">
        <div className="trust-inner">
          <div className="trust-quote">&ldquo;Most job boards assume you&apos;re already in the country. We built JobConnect AI for everyone else.&rdquo;</div>
          <div className="trust-name">Stevenson Jean-Louis — Founder, JobConnect AI · Ho Chi Minh City</div>
        </div>
      </section>

      <section className="cta-bottom">
        <div>
          <h2>Start finding remote jobs today</h2>
          <p>Free to join. No credit card required. Your next role is cross-border.</p>
          <a className="btn-primary" href="https://jobconnect-ai.com/register">Create Free Account</a>
        </div>
        <div>
          <div className="promo-box">
            🎁 Product Hunt exclusive offer
            <span className="promo-code">PHLAUNCH</span>
            1 month Premium free — expires Sep 30, 2026
          </div>
        </div>
      </section>

      <footer>
        <span>© 2026 JobConnect AI</span>
        <span><a href="https://jobconnect-ai.com" style={{ color: 'inherit', textDecoration: 'none' }}>jobconnect-ai.com</a></span>
      </footer>
    </>
  )
}
