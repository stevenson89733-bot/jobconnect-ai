"use client";
// components/landing/LandingNav.tsx
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "./LandingIcons";

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="landing-topbar">
      <Link className="landing-brand" href="/" aria-label="JobConnect AI">
        <Image
          src="/images/logo-jobconnect.png"
          alt="JobConnect AI"
          height={42}
          width={168}
          priority
          style={{ height: 42, width: "auto" }}
        />
      </Link>

      <nav
        className={`landing-nav-links${menuOpen ? " is-open" : ""}`}
        aria-label="Main navigation"
      >
        <a href="#jobs">Jobs</a>
        <a href="#tools">AI Tools</a>
        <a href="#how">How it works</a>
        <a href="#companies">Companies</a>
      </nav>

      <div className="landing-header-actions">
        <Link href="/auth/login" className="landing-text-btn">
          Log in
        </Link>
        <Link href="/auth/signup" className="landing-primary-btn landing-primary-btn--small">
          Get started <Icon name="arrow" size={16} />
        </Link>
        <button
          className="landing-menu-btn"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name="menu" size={20} />
        </button>
      </div>
    </header>
  );
}
