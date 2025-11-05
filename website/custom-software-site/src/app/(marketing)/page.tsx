import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home";

// Dynamic imports for below-fold components to improve initial load
const WhatWeBuild = dynamic(() => import('@/components/home/what-we-build').then(mod => ({ default: mod.WhatWeBuild })), {
  ssr: true,
});

const HowItWorks = dynamic(() => import('@/components/home/how-it-works').then(mod => ({ default: mod.HowItWorks })), {
  ssr: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://crownedgladiator.com'),
  title: 'Custom Software Development | Affordable Monthly Plans | Crowned Gladiator',
  description: 'Get custom platforms, websites, and applications built for your business at subscription prices. No huge upfront costs. You own everything. Start from $2,000 setup + $500/month.',
  keywords: 'custom software development, software subscription, Houston software development, business applications, custom platforms',
  openGraph: {
    title: 'Crowned Gladiator - Custom Software at Subscription Prices',
    description: 'Custom platforms, websites, and applications built specifically for your business workflow. Low setup fee, affordable monthly payments.',
    type: 'website',
    locale: 'en_US',
    url: 'https://crownedgladiator.com',
    siteName: 'Crowned Gladiator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Crowned Gladiator - Custom Software Development',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crowned Gladiator - Custom Software at Subscription Prices',
    description: 'Custom software built for your business. Low setup, monthly payments.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Crowned Gladiator',
    description: 'Custom software development with affordable monthly subscription plans',
    url: 'https://crownedgladiator.com',
    telephone: '+1-XXX-XXX-XXXX',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Houston',
      addressRegion: 'TX',
      addressCountry: 'US',
    },
    sameAs: [
      'https://www.linkedin.com/company/crowned-gladiator',
      'https://twitter.com/crownedgladiator',
    ],
    offers: {
      '@type': 'Offer',
      description: 'Custom software development starting at $2,000 setup + $500/month',
      priceCurrency: 'USD',
      price: '500',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '500',
        priceCurrency: 'USD',
        unitText: 'MONTH',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main id="main-content" className="flex-1">
        <Hero />
        <WhatWeBuild />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}