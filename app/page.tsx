import "@/styles/landing.css";
import { LandingNav }    from "@/components/landing/LandingNav";
import { LpHeroSection } from "@/components/landing/LpHeroSection";
import { TrustStrip }    from "@/components/landing/TrustStrip";
import { HowItWorks }    from "@/components/landing/HowItWorks";
import { ToolsSection }  from "@/components/landing/ToolsSection";
import { GlobalSection } from "@/components/landing/GlobalSection";
import { CTASection }    from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "JobConnect AI — AI-Powered Global Career Matching",
  description:
    "Discover remote, relocation-friendly, and visa-sponsored roles from companies that value global talent. AI-powered job matching, CV intelligence, and interview coaching.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "JobConnect AI — AI-Powered Global Career Matching",
    description:
      "Discover remote, relocation-friendly, and visa-sponsored roles from companies that value global talent. AI-powered job matching, CV intelligence, and interview coaching.",
    url: absoluteUrl("/"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobConnect AI — AI-Powered Global Career Matching",
    description:
      "Discover remote, relocation-friendly, and visa-sponsored roles from companies that value global talent.",
  },
};

export default function HomePage() {
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
