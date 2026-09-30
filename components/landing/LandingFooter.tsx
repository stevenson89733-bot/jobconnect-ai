// components/landing/LandingFooter.tsx
import Image from "next/image";

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <a href="/" className="landing-brand landing-footer-brand" aria-label="JobConnect AI">
        <Image
          src="/images/logo-jobconnect.png"
          alt="JobConnect AI"
          height={32}
          width={128}
          style={{ height: 32, width: "auto" }}
        />
      </a>
      <p>AI-powered careers for a world without borders.</p>
      <nav className="landing-foot-links" aria-label="Footer navigation">
        <a href="#jobs">Jobs</a>
        <a href="#tools">AI tools</a>
        <a href="#how">About</a>
        <a href="/privacy">Privacy</a>
      </nav>
      <small>© 2025 JobConnect AI. All rights reserved.</small>
    </footer>
  );
}
