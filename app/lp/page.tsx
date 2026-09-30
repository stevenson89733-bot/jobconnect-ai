// app/lp/page.tsx  — nouvelle landing Figma
// Pour basculer en homepage : copier le contenu dans app/page.tsx
import "@/styles/landing.css";
import { LandingNav }    from "@/components/landing/LandingNav";
import { LpHeroSection } from "@/components/landing/LpHeroSection";
import { TrustStrip }    from "@/components/landing/TrustStrip";
import { HowItWorks }    from "@/components/landing/HowItWorks";
import { ToolsSection }  from "@/components/landing/ToolsSection";
import { GlobalSection } from "@/components/landing/GlobalSection";
import { CTASection }    from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata = {
  title: "JobConnect AI — AI-Powered Global Career Matching",
  description:
    "Discover remote, relocation-friendly, and visa-sponsored roles from companies that value global talent. AI-powered job matching, CV intelligence, and interview coaching.",
  robots: { index: false }, // désactiver l'indexation jusqu'au go-live
};

export default function LandingPreviewPage() {
  return (
    <div className="landing-shell">
      <LandingNav />
      <main>
        <LpHeroSection />
        <TrustStrip />
        <HowItWorks />
        <ToolsSection />
        <GlobalSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
