// components/landing/CTASection.tsx
import Link from "next/link";
import { Icon } from "./LandingIcons";

export function CTASection() {
  return (
    <div className="landing-cta-wrap">
      <section className="landing-cta">
        <div className="landing-cta-ring landing-cta-ring--1" aria-hidden="true" />
        <div className="landing-cta-ring landing-cta-ring--2" aria-hidden="true" />
        <div className="landing-cta-icon">
          <Icon name="sparkles" size={25} />
        </div>
        <h2>
          Your next chapter could
          <br />
          start today.
        </h2>
        <p>
          Create your profile and let JobConnect AI find the roles you were
          meant to see.
        </p>
        <Link href="/register" className="landing-primary-btn">
          Find my matches <Icon name="arrow" size={17} />
        </Link>
        <span>No credit card required · Free to get started</span>
      </section>
    </div>
  );
}
