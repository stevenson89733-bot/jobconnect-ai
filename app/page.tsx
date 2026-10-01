import "@/styles/landing.css";
import { LandingNav }    from "@/components/landing/LandingNav";
import { LpHeroSection } from "@/components/landing/LpHeroSection";
import { TrustStrip }    from "@/components/landing/TrustStrip";
import { HowItWorks }    from "@/components/landing/HowItWorks";
import { ToolsSection }  from "@/components/landing/ToolsSection";
import { GlobalSection } from "@/components/landing/GlobalSection";
import { CTASection }    from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import CrispChat         from "@/components/CrispChat";
import CopilotWidget     from "@/components/copilot/CopilotWidget";
import { createClient }  from "@/lib/supabase/server";
import type { Metadata } from "next";
import { absoluteUrl }   from "@/lib/seo";

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

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let isCandidate = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, role")
      .eq("user_id", user.id)
      .single();
    isAdmin = profile?.is_admin === true;
    isCandidate = profile?.role === "candidate";
  }

  return (
    <div className="landing-shell">
      <LandingNav userEmail={user?.email ?? null} isAdmin={isAdmin} />
      <main>
        <LpHeroSection />
        <TrustStrip />
        <HowItWorks />
        <ToolsSection />
        <GlobalSection />
        <CTASection />
      </main>
      <LandingFooter />
      <CrispChat />
      {isCandidate && <CopilotWidget />}
    </div>
  );
}
