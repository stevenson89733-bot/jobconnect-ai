// components/landing/TrustStrip.tsx
import { getTranslations } from "next-intl/server";

export async function TrustStrip() {
  const t = await getTranslations("landing");

  return (
    <section className="landing-trust" id="jobs" aria-label="Platform partners">
      <p>{t("trustIntro")}</p>
      <div className="landing-company-cloud">
        <span><b>◎</b> ORBIT</span>
        <span><b>⌁</b> STRIPE</span>
        <span><b>◇</b> LINEAR</span>
        <span><b>✣</b> VERCEL</span>
        <span><b>△</b> NOTION</span>
      </div>
    </section>
  );
}
