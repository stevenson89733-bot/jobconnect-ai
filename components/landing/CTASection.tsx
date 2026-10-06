// components/landing/CTASection.tsx
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "./LandingIcons";

export async function CTASection() {
  const t = await getTranslations("landing");

  return (
    <div className="landing-cta-wrap">
      <section className="landing-cta">
        <div className="landing-cta-ring landing-cta-ring--1" aria-hidden="true" />
        <div className="landing-cta-ring landing-cta-ring--2" aria-hidden="true" />
        <div className="landing-cta-icon">
          <Icon name="sparkles" size={25} />
        </div>
        <h2>
          {t("ctaH2Part1")}
          <br />
          {t("ctaH2Part2")}
        </h2>
        <p>{t("ctaP")}</p>
        <Link href="/register" className="landing-primary-btn">
          {t("ctaBtn")} <Icon name="arrow" size={17} />
        </Link>
        <span>{t("ctaSub")}</span>
      </section>
    </div>
  );
}
