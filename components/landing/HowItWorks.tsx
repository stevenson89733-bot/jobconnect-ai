// components/landing/HowItWorks.tsx
import { getTranslations } from "next-intl/server";
import { Icon } from "./LandingIcons";

export async function HowItWorks() {
  const t = await getTranslations("landing");

  const STEPS = [
    {
      num: "01",
      icon: "upload" as const,
      title: t("howStep1Title"),
      copy: t("howStep1Copy"),
    },
    {
      num: "02",
      icon: "sparkles" as const,
      title: t("howStep2Title"),
      copy: t("howStep2Copy"),
    },
    {
      num: "03",
      icon: "briefcase" as const,
      title: t("howStep3Title"),
      copy: t("howStep3Copy"),
    },
  ];

  return (
    <section id="how" className="landing-how">
      <div className="landing-section-head">
        <span className="landing-kicker">{t("howKicker")}</span>
        <h2>{t("howH2")}</h2>
        <p>{t("howP")}</p>
      </div>

      <div className="landing-steps-grid">
        {STEPS.map((step) => (
          <article className="landing-step" key={step.num}>
            <span className="landing-step-num">{step.num}</span>
            <div className="landing-step-icon">
              <Icon name={step.icon} size={25} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
