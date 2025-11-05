import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AboutHero } from "@/components/about/about-hero";
import { OurBelief } from "@/components/about/our-belief";
import { OurApproach } from "@/components/about/our-approach";
import { WhyDifferent } from "@/components/about/why-different";
import { LocationContact } from "@/components/about/location-contact";
import { AboutCTA } from "@/components/about/about-cta";

export const metadata: Metadata = {
  title: "About - Software Should Adapt to You | CustomSoft",
  description:
    "We believe every business deserves custom software without enterprise pricing. Based in Houston, serving businesses everywhere.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <AboutHero />

        {/* Our Belief Section */}
        <OurBelief />

        {/* Our Approach Section */}
        <OurApproach />

        {/* Why We're Different */}
        <WhyDifferent />

        {/* Location/Contact Section */}
        <LocationContact />

        {/* CTA Section */}
        <AboutCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
