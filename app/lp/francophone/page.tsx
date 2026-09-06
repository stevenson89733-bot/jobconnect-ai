import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JobConnect AI — Emplois à distance pour les francophones du monde entier',
}

const css = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --ink: #13111A; --ink-soft: #5B5470; --bg: #F8F7FC; --bg-card: #FFFFFF;
  --accent: #6B3FA0; --accent-light: #F0EAF8; --accent-2: #E8A020;
  --border: #E4DFF2; --radius: 8px;
}
body { font-family: 'Syne', sans-serif; background: var(--bg); color: var(--ink); line-height: 1.6; -webkit-font-smoothing: antialiased; }
nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 52px; background: var(--bg); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
.logo { font-weight: 700; font-size: 18px; color: var(--ink); text-decoration: none; }
.logo span { color: var(--accent); }
.nav-right { display: flex; align-items: center; gap: 20px; }
.nav-lang { font-size: 13px; color: var(--ink-soft); }
.nav-cta { background: var(--accent); color: #fff; padding: 10px 22px; border-radius: var(--radius); text-decoration: none; font-weight: 600; font-size: 14px; }
.hero { max-width: 1100px; margin: 0 auto; padding: 88px 52px 72px; }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.hero-eyebrow { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
.hero-flag-group { display: flex; gap: 4px; }
.hero-eyebrow-text { font-size: 13px; color: var(--ink-soft); font-weight: 500; }
.hero h1 { font-family: 'Lora', serif; font-size: clamp(36px, 4.5vw, 56px); line-height: 1.12; color: var(--ink); margin-bottom: 22px; font-weight: 600; }
.hero h1 em { font-style: italic; color: var(--accent); }
.hero-sub { font-size: 16px; color: var(--ink-soft); max-width: 440px; margin-bottom: 36px; line-height: 1.7; font-family: 'Lora', serif; font-weight: 400; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-primary { background: var(--accent); color: #fff; padding: 14px 28px; border-radius: var(--radius); text-decoration: none; font-weight: 600; font-size: 15px; }
.btn-secondary { background: transparent; color: var(--accent); padding: 14px 24px; border-radius: var(--radius); border: 1.5px solid var(--accent); text-decoration: none; font-weight: 500; font-size: 15px; }
.hero-right { position: relative; }
.apply-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: 0 8px 32px rgba(107,63,160,.08); }
.apply-card-header { font-size: 13px; font-weight: 600; color: var(--accent); margin-bottom: 16px; display: flex; align-items: center; gap: 6px; }
.apply-role { font-family: 'Lora', serif; font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.apply-company { font-size: 13px; color: var(--ink-soft); margin-bottom: 16px; }
.apply-fields { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.apply-field { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; font-size: 13px; color: var(--ink-soft); }
.apply-field strong { color: var(--ink); display: block; font-size: 11px; margin-bottom: 2px; font-weight: 600; }
.apply-btn { width: 100%; background: var(--accent); color: #fff; border: none; padding: 13px; border-radius: var(--radius); font-weight: 600; font-size: 14px; font-family: 'Syne', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
.score-badge { position: absolute; top: -16px; right: -16px; background: var(--accent-2); color: #fff; padding: 10px 14px; border-radius: 10px; font-weight: 700; font-size: 20px; box-shadow: 0 4px 16px rgba(232,160,32,.3); text-align: center; line-height: 1; }
.score-badge span { font-size: 11px; display: block; font-weight: 500; margin-top: 2px; opacity: .85; }
.pays-section { background: var(--accent); padding: 48px 52px; }
.pays-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 32px; flex-wrap: wrap; }
.pays-title { font-size: 16px; color: rgba(255,255,255,.8); font-weight: 500; flex-shrink: 0; }
.pays-flags { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.pays-flag { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.15); padding: 6px 12px; border-radius: 20px; font-size: 13px; color: #fff; font-weight: 500; }
.features { max-width: 1100px; margin: 0 auto; padding: 80px 52px; }
.features h2 { font-family: 'Lora', serif; font-size: clamp(28px, 3vw, 40px); color: var(--ink); margin-bottom: 12px; font-weight: 600; }
.features-sub { font-size: 16px; color: var(--ink-soft); margin-bottom: 48px; font-family: 'Lora', serif; }
.features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.feature-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 28px; }
.feature-icon { font-size: 26px; margin-bottom: 14px; }
.feature-title { font-weight: 700; font-size: 16px; margin-bottom: 8px; }
.feature-desc { font-size: 14px; color: var(--ink-soft); line-height: 1.65; font-family: 'Lora', serif; }
.cta-section { background: var(--ink); padding: 80px 52px; }
.cta-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.cta-section h2 { font-family: 'Lora', serif; font-size: clamp(28px, 3vw, 42px); color: #fff; margin-bottom: 16px; font-weight: 600; }
.cta-section p { font-size: 16px; color: rgba(255,255,255,.7); margin-bottom: 32px; font-family: 'Lora', serif; }
.btn-white { background: #fff; color: var(--accent); padding: 15px 32px; border-radius: var(--radius); text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; }
.promo-box { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.15); border-radius: var(--radius); padding: 24px; }
.promo-box-label { font-size: 12px; color: rgba(255,255,255,.5); margin-bottom: 8px; }
.promo-code { font-size: 28px; font-weight: 800; color: var(--accent-2); letter-spacing: .05em; }
.promo-desc { font-size: 14px; color: rgba(255,255,255,.6); margin-top: 6px; font-family: 'Lora', serif; }
footer { border-top: 1px solid var(--border); padding: 24px 52px; display: flex; justify-content: space-between; font-size: 13px; color: var(--ink-soft); }
@media (max-width: 768px) {
  nav { padding: 16px 20px; }
  .hero { padding: 48px 20px; }
  .hero-inner { grid-template-columns: 1fr; }
  .hero-right { display: none; }
  .pays-section { padding: 32px 20px; }
  .features { padding: 48px 20px; }
  .features-grid { grid-template-columns: 1fr; }
  .cta-section { padding: 56px 20px; }
  .cta-inner { grid-template-columns: 1fr; }
  footer { flex-direction: column; gap: 8px; padding: 20px; }
}
`

export default function LpFrancophonePage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <nav>
        <a className="logo" href="https://jobconnect-ai.com">JobConnect <span>AI</span></a>
        <div className="nav-right">
          <span className="nav-lang">🇫🇷 Français</span>
          <a className="nav-cta" href="https://jobconnect-ai.com/register">Commencer gratuitement</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">
              <div className="hero-flag-group">🇫🇷 🇧🇪 🇨🇭 🇨🇦 🇸🇳 🇨🇮 🇭🇹</div>
              <span className="hero-eyebrow-text">Pour les francophones du monde entier</span>
            </div>
            <h1>L&apos;emploi à distance, <em>sans frontières</em></h1>
            <p className="hero-sub">Que vous soyez à Paris, Dakar, Montréal ou Abidjan — JobConnect AI vous connecte aux meilleurs postes à distance dans le monde, et vous aide à postuler en quelques secondes.</p>
            <div className="hero-actions">
              <a className="btn-primary" href="https://jobconnect-ai.com/register">Trouver mon poste</a>
              <a className="btn-secondary" href="https://jobconnect-ai.com/jobs">Voir les offres</a>
            </div>
          </div>
          <div className="hero-right">
            <div className="apply-card">
              <div className="apply-card-header">✦ Postuler avec l&apos;IA</div>
              <div className="apply-role">Chef de Projet Digital</div>
              <div className="apply-company">Stripe · Worldwide Remote · $85k–110k</div>
              <div className="apply-fields">
                <div className="apply-field">
                  <strong>CV adapté généré</strong>
                  CV_ChefProjet_Stripe.pdf
                </div>
                <div className="apply-field">
                  <strong>Lettre de motivation</strong>
                  Rédigée et adaptée au poste ✓
                </div>
              </div>
              <button className="apply-btn">⬇ Télécharger et postuler</button>
            </div>
            <div className="score-badge">ATS 82<span>Score</span></div>
          </div>
        </div>
      </section>

      <section className="pays-section">
        <div className="pays-inner">
          <span className="pays-title">Communauté active dans :</span>
          <div className="pays-flags">
            <span className="pays-flag">🇫🇷 France</span>
            <span className="pays-flag">🇧🇪 Belgique</span>
            <span className="pays-flag">🇨🇭 Suisse</span>
            <span className="pays-flag">🇨🇦 Canada</span>
            <span className="pays-flag">🇸🇳 Sénégal</span>
            <span className="pays-flag">🇨🇮 Côte d&apos;Ivoire</span>
            <span className="pays-flag">🇭🇹 Haïti</span>
            <span className="pays-flag">🇲🇦 Maroc</span>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Tout pour décrocher un poste à distance</h2>
        <p className="features-sub">De la recherche à la candidature — sans quitter la plateforme.</p>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <div className="feature-title">Score de compatibilité IA</div>
            <div className="feature-desc">Chaque offre reçoit un score basé sur vos compétences, votre expérience et votre flexibilité géographique. Fini les candidatures à l&apos;aveugle.</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📄</div>
            <div className="feature-title">CV optimisé ATS</div>
            <div className="feature-desc">Générez un CV adapté à chaque offre en quelques secondes — avec un score ATS de 0 à 100, des suggestions de mots-clés et des conseils d&apos;amélioration.</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">✉️</div>
            <div className="feature-title">Postuler avec l&apos;IA</div>
            <div className="feature-desc">Un clic génère un CV adapté et une lettre de motivation personnalisée pour le poste visé. Téléchargez en PDF et envoyez immédiatement.</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤖</div>
            <div className="feature-title">Auto-Candidature Beta</div>
            <div className="feature-desc">Déposez votre CV une seule fois. JobConnect AI vous associe à de nouvelles offres chaque jour et envoie des candidatures en votre nom.</div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <div>
            <h2>Votre prochain poste à distance vous attend</h2>
            <p>Gratuit pour commencer. Aucune carte bancaire requise. Rejoignez des milliers de professionnels francophones.</p>
            <a className="btn-white" href="https://jobconnect-ai.com/register">Créer mon compte gratuit</a>
          </div>
          <div className="promo-box">
            <div className="promo-box-label">🎁 Offre exclusive Product Hunt</div>
            <div className="promo-code">PHLAUNCH</div>
            <div className="promo-desc">1 mois Premium offert — valable jusqu&apos;au 30 septembre 2026</div>
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
