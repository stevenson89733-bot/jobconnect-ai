// components/landing/ToolsSection.tsx
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon, IconName } from "./LandingIcons";

export async function ToolsSection() {
  const t = await getTranslations("landing");

  const TOOLS: { icon: IconName; eyebrow: string; title: string; copy: string; accent: string }[] = [
    {
      icon: "file",
      eyebrow: t("tool1Eyebrow"),
      title: t("tool1Title"),
      copy: t("tool1Copy"),
      accent: "blue",
    },
    {
      icon: "target",
      eyebrow: t("tool2Eyebrow"),
      title: t("tool2Title"),
      copy: t("tool2Copy"),
      accent: "purple",
    },
    {
      icon: "wand",
      eyebrow: t("tool3Eyebrow"),
      title: t("tool3Title"),
      copy: t("tool3Copy"),
      accent: "coral",
    },
  ];

  return (
    <section id="tools" className="landing-tools">
      <div className="landing-tools-intro">
        <span className="landing-kicker landing-kicker--light">
          {t("toolsKicker")}
        </span>
        <h2>
          {t("toolsH2Part1")}
          <br />
          <span>{t("toolsH2Span")}</span>
        </h2>
        <p>{t("toolsP")}</p>
        <Link href="/jobs">
          {t("toolsExploreLink")} <Icon name="arrow" size={16} />
        </Link>
      </div>

      <div className="landing-tools-list">
        {TOOLS.map((tool) => (
          <article className="landing-tool-card" key={tool.title}>
            <div className={`landing-tool-icon landing-tool-icon--${tool.accent}`}>
              <Icon name={tool.icon} size={24} />
            </div>
            <div className="landing-tool-card-content">
              <span>{tool.eyebrow}</span>
              <h3>{tool.title}</h3>
              <p>{tool.copy}</p>
            </div>
            <Link href="/jobs" aria-label={`Learn more about ${tool.title}`} className="landing-tool-arrow">
              <Icon name="arrow" size={18} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
