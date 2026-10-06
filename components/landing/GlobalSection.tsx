// components/landing/GlobalSection.tsx
import { getTranslations } from "next-intl/server";

export async function GlobalSection() {
  const t = await getTranslations("landing");

  return (
    <section id="companies" className="landing-global">
      <div>
        <span className="landing-kicker">{t("globalKicker")}</span>
        <h2>
          {t("globalH2Part1")}
          <br />
          {t("globalH2Part2")}
        </h2>
      </div>
      <div className="landing-global-copy">
        <p>{t("globalP")}</p>
        <dl className="landing-global-stats">
          <div>
            <dt>{t("globalStat1Value")}</dt>
            <dd>{t("globalStat1Label")}</dd>
          </div>
          <div>
            <dt>{t("globalStat2Value")}</dt>
            <dd>{t("globalStat2Label")}</dd>
          </div>
          <div>
            <dt>{t("globalStat3Value")}</dt>
            <dd>{t("globalStat3Label")}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
