import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JobConnect AI — AI-Powered Remote Jobs for Global Talent',
}

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --ink: #0C0F1A; --ink-soft: #4A5068; --bg: #FAFBFF; --bg-card: #FFFFFF;
  --accent: #2952E3; --accent-light: #EEF2FD; --accent-2: #0EA87A;
  --border: #E2E6F3; --radius: 8px;
}
body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--ink); line-height: 1.6; -webkit-font-smoothing: antialiased; }
nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 56px; background: var(--bg); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
.logo { font-weight: 700; font-size: 18px; color: var(--ink); text-decoration: none; }
.logo span { color: var(--accent); }
.nav-cta { background: var(--accent); color: #fff; padding: 10px 22px; border-radius: var(--radius); text-decoration: none; font-weight: 600; font-size: 14px; }
.hero { max-width: 1100px; margin: 0 auto; padding: 96px 56px 80px; display: grid; grid-template-columns: 58% 42%; gap: 56px; align-items: start; }
.hero-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--accent-2); background: #E6F8F2; padding: 5px 12px; border-radius: 20px; margin-bottom: 28px; }
.hero h1 { font-family: 'Fraunces', serif; font-size: clamp(40px, 5vw, 62px); line-height: 1.1; color: var(--ink); margin-bottom: 24px; font-weight: 700; }
.hero h1 .highlight { color: var(--accent); font-style: italic; }
.hero-sub { font-size: 17px; color: var(--ink-soft); max-width: 480px; margin-bottom: 40px; line-height: 1.7; font-weight: 400; }
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
.btn-primary { background: var(--accent); color: #fff; padding: 15px 30px; border-radius: var(--radius); text-decoration: none; font-weight: 600; font-size: 15px; }
.btn-ghost { color: var(--ink); padding: 15px 20px; text-decoration: none; font-weight: 500; font-size: 15px; display: flex; align-items: center; gap: 6px; }
.stats-strip { display: flex; flex-direction: column; gap: 20px; padding-top: 8px; }
.stat-block { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 24px; }
.stat-block-num { font-family: 'Fraunces', serif; font-size: 38px; font-weight: 700; color: var(--accent); line-height: 1; }
.stat-block-label { font-size: 13px; color: var(--ink-soft); margin-top: 4px; }
.how { background: var(--ink); padding: 80px 56px; }
.how-inner { max-width: 1100px; margin: 0 auto; }
.how-title { font-family: 'Fraunces', serif; font-size: clamp(28px, 3vw, 40px); color: #fff; margin-bottom: 48px; font-weight: 700; }
.how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.how-step { border-left: 2px solid var(--accent); padding-left: 20px; }
.how-step-num { font-size: 12px; color: var(--accent); font-weight: 600; margin-bottom: 12px; }
.how-step-title { font-weight: 600; color: #fff; font-size: 16px; margin-bottom: 8px; }
.how-step-desc { font-size: 14px; color: rgba(255,255,255,.6); line-height: 1.6; }
.features { max-width: 1100px; margin: 0 auto; padding: 80px 56px; }
.features-header { margin-bottom: 48px; }
.features-header h2 { font-family: 'Fraunces', serif; font-size: clamp(28px, 3vw, 40px); color: var(--ink); font-weight: 700; margin-bottom: 12px; }
.features-header p { font-size: 16px; color: var(--ink-soft); max-width: 480px; }
.features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.feature-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 28px; }
.feature-icon { font-size: 24px; margin-bottom: 14px; }
.feature-title { font-weight: 600; font-size: 16px; margin-bottom: 8px; }
.feature-desc { font-size: 14px; color: var(--ink-soft); line-height: 1.6; }
.feature-tag { display: inline-block; margin-top: 12px; font-size: 11px; font-weight: 600; background: var(--accent-light); color: var(--accent); padding: 3px 8px; border-radius: 4px; }
.cta-section { background: var(--accent); padding: 80px 56px; text-align: center; }
.cta-section h2 { font-family: 'Fraunces', serif; font-size: clamp(28px, 3.5vw, 46px); color: #fff; margin-bottom: 16px; font-weight: 700; }
.cta-section p { font-size: 17px; color: rgba(255,255,255,.8); margin-bottom: 36px; }
.btn-white { background: #fff; color: var(--accent); padding: 16px 36px; border-radius: var(--radius); text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; }
.promo-note { margin-top: 20px; font-size: 13px; color: rgba(255,255,255,.7); }
.promo-note strong { color: #fff; }
footer { border-top: 1px solid var(--border); padding: 24px 56px; display: flex; justify-content: space-between; font-size: 13px; color: var(--ink-soft); }
@media (max-width: 768px) {
  nav { padding: 16px 20px; }
  .hero { grid-template-columns: 1fr; padding: 48px 20px; }
  .stats-strip { flex-direction: row; flex-wrap: wrap; }
  .stat-block { flex: 1; min-width: 140px; }
  .how { padding: 48px 20px; }
  .how-grid { grid-template-columns: 1fr; gap: 24px; }
  .features { padding: 48px 20px; }
  .features-grid { grid-template-columns: 1fr; }
  .cta-section { padding: 56px 20px; }
  footer { flex-direction: column; gap: 8px; padding: 20px; }
}
`

export default function LpAnglophonePage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav>
        <a className="logo" href="https://jobconnect-ai.com">JobConnect <span>AI</span></a>
        <a className="nav-cta" href="https://jobconnect-ai.com/register">Get Started Free</a>
      </nav>

      <section className="hero">
        <div>
          <div className="hero-badge">✦ Now in open beta</div>
          <h1>The remote job board built for <span className="highlight">global careers</span></h1>
          <p className="hero-sub">AI matching, instant applications, and cross-border job search — for professionals who don&apos;t want geography to limit their career.</p>
          <div className="hero-actions">
            <a className="btn-primary" href="https://jobconnect-ai.com/register">Start for Free</a>
            <a className="btn-ghost" href="https://jobconnect-ai.com/jobs">Browse Jobs →</a>
          </div>
        </div>
        <div className="stats-strip">
          <div className="stat-block">
            <div className="stat-block-num">10k+</div>
            <div className="stat-block-label">Verified remote openings</div>
          </div>
          <div className="stat-block">
            <div className="stat-block-num">60s</div>
            <div className="stat-block-label">Average time to apply with AI</div>
          </div>
          <div className="stat-block">
            <div className="stat-block-num">ATS 80</div>
            <div className="stat-block-label">Average resume score generated</div>
          </div>
        </div>
      </section>

      <section className="how">
        <div className="how-inner">
          <h2 className="how-title">How it works</h2>
          <div className="how-grid">
            <div className="how-step">
              <div className="how-step-num">Step 1</div>
              <div className="how-step-title">Build your profile</div>
              <div className="how-step-desc">Upload your CV or fill in your skills and target role. Takes under 3 minutes.</div>
            </div>
            <div className="how-step">
              <div className="how-step-num">Step 2</div>
              <div className="how-step-title">Get matched</div>
              <div className="how-step-desc">Our AI scores every job against your profile — you see your match percentage before applying.</div>
            </div>
            <div className="how-step">
              <div className="how-step-num">Step 3</div>
              <div className="how-step-title">Apply in seconds</div>
              <div className="how-step-desc">One click generates a tailored CV and cover letter for the role. Download as PDF and send.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-header">
          <h2>Everything you need to land a remote role</h2>
          <p>No more generic applications. No more guessing if a job is actually remote-friendly.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <div className="feature-title">AI Match Score</div>
            <div className="feature-desc">See how well each job fits your profile before you spend time on it. Ranked by skill fit, location flexibility, and verified hiring signals.</div>
            <span className="feature-tag">Candidate-side AI</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <div className="feature-title">ATS Resume Builder</div>
            <div className="feature-desc">Generate ATS-optimized resumes tailored to each role. Includes a 0–100 score, keyword gaps, and grammar suggestions.</div>
            <span className="feature-tag">GPT-4o powered</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✉️</div>
            <div className="feature-title">Apply with AI</div>
            <div className="feature-desc">Adapted CV + personalized cover letter generated instantly for any job. Both available as downloadable PDFs.</div>
            <span className="feature-tag">One-click apply</span>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <div className="feature-title">Auto-Apply</div>
            <div className="feature-desc">Upload your CV once — we match you to new roles daily and send applications on your behalf. Wake up to new opportunities.</div>
            <span className="feature-tag">Pro feature</span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Your next remote role is waiting</h2>
        <p>Join professionals from 190+ countries already using JobConnect AI.</p>
        <a className="btn-white" href="https://jobconnect-ai.com/register">Create Free Account</a>
        <div className="promo-note">Use code <strong>PHLAUNCH</strong> for 1 month Premium free — expires Sep 30, 2026</div>
      </section>

      <footer>
        <span>© 2026 JobConnect AI</span>
        <span><a href="https://jobconnect-ai.com" style={{ color: 'inherit', textDecoration: 'none' }}>jobconnect-ai.com</a></span>
      </footer>
    </>
  )
}
