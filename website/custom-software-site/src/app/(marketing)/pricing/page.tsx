import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PricingHero } from '@/components/pricing/pricing-hero';
import { PricingModel } from '@/components/pricing/pricing-model';
import { MobileStickyCTA } from '@/components/pricing/mobile-sticky-cta';

// Dynamic imports for below-fold content
const PricingTiers = dynamic(() => import('@/components/pricing/pricing-tiers').then(mod => ({ default: mod.PricingTiers })));
const PricingComparison = dynamic(() => import('@/components/pricing/pricing-comparison').then(mod => ({ default: mod.PricingComparison })));
const PricingFAQ = dynamic(() => import('@/components/pricing/pricing-faq').then(mod => ({ default: mod.PricingFAQ })));
const PricingCTA = dynamic(() => import('@/components/pricing/pricing-cta').then(mod => ({ default: mod.PricingCTA })));

export const metadata: Metadata = {
  title: 'Transparent Pricing | Custom Software Subscription | Crowned Gladiator',
  description: 'Simple, transparent pricing for custom software development. Low setup fees starting at $2,000, affordable monthly payments from $500. You own all the code.',
  keywords: 'software development pricing, subscription software, custom app cost, website development pricing',
  openGraph: {
    title: 'Transparent Pricing - No Surprises | Crowned Gladiator',
    description: 'Custom software at subscription prices. Low setup fee, affordable monthly payments.',
    type: 'website',
    url: 'https://crownedgladiator.com/pricing',
  },
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PricingHero />
        <PricingModel />
        <PricingTiers />
        <PricingComparison />
        <PricingFAQ />
        <PricingCTA />
      </main>
      <Footer />
      <MobileStickyCTA />
    </>
  );
}
