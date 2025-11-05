'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

const pricingTiers = [
  {
    name: "Simple Systems",
    setup: "From $2,000",
    monthly: "From $500/mo",
    timeline: "3-4 weeks",
    examples: [
      "Basic customer database",
      "Simple inventory tracker",
      "Team task manager",
      "Document management"
    ],
    featured: false
  },
  {
    name: "Standard Business Apps",
    setup: "From $5,000",
    monthly: "From $950/mo",
    timeline: "6-8 weeks",
    examples: [
      "Full CRM system",
      "Workflow automation",
      "Custom dashboards",
      "Advanced reporting"
    ],
    featured: true,
    badge: "Most Popular"
  },
  {
    name: "Complex Platforms",
    setup: "Custom quote",
    monthly: "Custom quote",
    timeline: "8-12 weeks",
    examples: [
      "Multi-location systems",
      "Complex integrations",
      "Industry platforms",
      "Enterprise solutions"
    ],
    featured: false
  }
];

export function PricingTiers() {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto md:px-0 overflow-x-auto snap-x snap-mandatory md:overflow-visible scrollbar-hide"
    >
      {pricingTiers.map((tier, index) => (
        <div
          key={tier.name}
          className={cn(
            "relative flex transition-all duration-700 snap-center",
            "min-w-[280px] md:min-w-0",
            isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{
            transitionDelay: isIntersecting ? `${index * 150}ms` : '0ms'
          }}
        >
          {tier.featured && tier.badge && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                {tier.badge}
              </span>
            </div>
          )}
          <Card
            onMouseEnter={() => setHoveredTier(tier.name)}
            onMouseLeave={() => setHoveredTier(null)}
            onTouchStart={() => setHoveredTier(tier.name)}
            onTouchEnd={() => setHoveredTier(null)}
            className={cn(
              "flex flex-col w-full transition-all duration-300 cursor-pointer",
              "active:scale-[0.98] touch-manipulation",
              tier.featured
                ? 'border-2 border-primary shadow-lg scale-105 md:scale-110'
                : 'border',
              hoveredTier === tier.name && "shadow-xl border-primary/50 scale-105"
            )}
          >
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription className="text-lg font-semibold text-foreground mt-2">
                {tier.setup}
              </CardDescription>
              <CardDescription className="text-base">
                {tier.monthly}
              </CardDescription>
              <CardDescription className="text-sm mt-1">
                Timeline: {tier.timeline}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.examples.map((example) => (
                  <li key={example} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{example}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full active:scale-95 transition-transform"
                variant={tier.featured ? "default" : "outline"}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <Link href="/contact">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
}
