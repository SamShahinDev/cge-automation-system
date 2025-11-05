import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PricingModelExplanation } from "@/components/pricing/pricing-model-explanation";
import { InvestmentTiers } from "@/components/pricing/investment-tiers";
import { PricingComparison } from "@/components/pricing/pricing-comparison";
import { PricingFAQ } from "@/components/pricing/pricing-faq";
import { PricingCTA } from "@/components/pricing/pricing-cta";
import { PricingSidebarNav } from "@/components/pricing/pricing-sidebar-nav";

export const metadata: Metadata = {
  title: "Pricing - CustomSoft",
  description:
    "Simple, transparent pricing for custom software development. Low setup fees, affordable monthly payments. You own all the code.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <Header />

      {/* Sidebar Navigation */}
      <PricingSidebarNav />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <PricingHero />

        {/* Pricing Model Explanation */}
        <PricingModelExplanation />

        {/* Investment Tiers */}
        <InvestmentTiers />

        {/* Comparison Section */}
        <PricingComparison />

        {/* FAQ Section */}
        <PricingFAQ />

        {/* CTA Section */}
        <PricingCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
