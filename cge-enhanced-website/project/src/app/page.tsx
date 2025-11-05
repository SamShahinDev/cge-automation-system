import { Header } from "@/components/layout/header";
import { Hero } from "@/components/home/hero";
import { WhatWeBuild } from "@/components/home/what-we-build";
import dynamic from "next/dynamic";
import { Footer } from "@/components/layout/footer";

// Dynamically import below-fold components for better performance
const HowItWorks = dynamic(() => import("@/components/home/how-it-works"), {
  ssr: true,
});

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <Header />

      {/* Main Content */}
      <main>
        {/* Hero Section - Above the fold */}
        <Hero />

        {/* What We Build Section */}
        <WhatWeBuild />

        {/* How It Works Section - Below the fold, dynamically imported */}
        <HowItWorks />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
