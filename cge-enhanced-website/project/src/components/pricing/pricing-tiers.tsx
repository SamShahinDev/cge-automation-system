"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatedSection } from '@/components/ui/animated-section';

interface PricingTier {
  id: string;
  name: string;
  setup: string;
  monthly: string;
  examples: string[];
  timeline: string;
  featured?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'simple',
    name: 'Simple Systems',
    setup: 'From $2,000',
    monthly: 'From $500/mo',
    examples: [
      'Basic customer database',
      'Simple inventory tracker',
      'Team task manager',
    ],
    timeline: '3-4 weeks',
  },
  {
    id: 'standard',
    name: 'Standard Business Apps',
    setup: 'From $5,000',
    monthly: 'From $950/mo',
    examples: [
      'Full CRM system',
      'Workflow automation',
      'Custom dashboards',
    ],
    timeline: '6-8 weeks',
    featured: true,
  },
  {
    id: 'complex',
    name: 'Complex Platforms',
    setup: 'Custom quote',
    monthly: 'Custom quote',
    examples: [
      'Multi-location systems',
      'Complex integrations',
      'Industry platforms',
    ],
    timeline: '8-12 weeks',
  },
];

export function PricingTiers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // Read tier from URL on mount
  useEffect(() => {
    const tierParam = searchParams.get('tier');
    if (tierParam) {
      setSelectedTier(tierParam);
    }
  }, [searchParams]);

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);

    // Update URL with selected tier
    const params = new URLSearchParams(searchParams);
    params.set('tier', tierId);
    router.push(`?${params.toString()}`, { scroll: false });

    // Smooth scroll to CTA section
    setTimeout(() => {
      const ctaSection = document.querySelector('[data-section="cta"]');
      if (ctaSection) {
        ctaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <section id="tiers" className="w-full bg-muted py-[100px]">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Heading */}
        <AnimatedSection animation="fade" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Investment Ranges
          </h2>
          <p className="text-lg text-muted-foreground">
            Every project is unique. These ranges help you budget.
          </p>
        </AnimatedSection>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, idx) => {
            const isSelected = selectedTier === tier.id;

            return (
              <AnimatedSection
                key={tier.name}
                animation="slide-up"
                delay={idx * 150}
              >
              <Card
                className={`flex flex-col transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 scale-105'
                    : tier.featured
                    ? 'border-primary shadow-lg hover:shadow-xl'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleTierSelect(tier.id)}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 space-y-6">
                  {/* Pricing */}
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Setup</div>
                      <div className="text-xl font-semibold">{tier.setup}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Monthly</div>
                      <div className="text-xl font-semibold">{tier.monthly}</div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div>
                    <div className="text-sm font-medium mb-3">Examples:</div>
                    <ul className="space-y-2">
                      {tier.examples.map((example) => (
                        <li key={example} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Timeline */}
                  <div>
                    <div className="text-sm text-muted-foreground">Timeline</div>
                    <div className="font-medium">{tier.timeline}</div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.featured || isSelected ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTierSelect(tier.id);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Get Started'}
                  </Button>
                </CardFooter>
              </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
