"use client";

import { Check } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { CountUp } from "@/components/ui/count-up";

export function PricingModelExplanation() {
  const features = [
    "Low upfront setup fee",
    "Affordable monthly payments",
    "You own all the code",
    "No long-term contracts",
    "Cancel anytime after launch",
    "Includes hosting and maintenance",
  ];

  return (
    <section id="model" className="py-16 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <AnimatedSection animation="fade" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Our Pricing Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe custom software should be accessible. That&apos;s why we
            offer subscription-style pricing that spreads the cost over time.
          </p>
        </AnimatedSection>

        <AnimatedSection animation="slide-up" delay={200}>
          <div className="bg-card border border-border rounded-lg p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Setup Fee
                </h3>
                <p className="text-muted-foreground mb-4">
                  A one-time payment to kickstart your project. This covers
                  initial planning, design, and development setup.
                </p>
                <p className="text-2xl font-bold text-primary">
                  Starting at <CountUp end={2000} prefix="$" />
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Monthly Payments
                </h3>
                <p className="text-muted-foreground mb-4">
                  Spread the remaining cost over 12-24 months. Includes hosting,
                  maintenance, and support during the payment period.
                </p>
                <p className="text-2xl font-bold text-primary">
                  <CountUp end={200} prefix="$" /> - <CountUp end={2000} prefix="$" />/mo
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-border">
              <h4 className="text-lg font-semibold text-foreground mb-6">
                What&apos;s Included
              </h4>
              <ul className="grid sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <AnimatedSection
                    key={index}
                    animation="slide-left"
                    delay={400 + index * 100}
                    duration={400}
                  >
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  </AnimatedSection>
                ))}
              </ul>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
