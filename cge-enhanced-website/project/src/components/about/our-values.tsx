"use client";

import { AnimatedSection } from "@/components/ui/animated-section";

const values = [
  {
    name: "Transparency",
    description: "No hidden costs, no surprises, no fine print",
  },
  {
    name: "Ownership",
    description: "Your business, your software, your intellectual property",
  },
  {
    name: "Excellence",
    description: "Enterprise quality without enterprise complexity",
  },
  {
    name: "Partnership",
    description: "Your success is our success, period",
  },
];

export default function OurValues() {
  return (
    <section className="py-20">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Heading */}
        <AnimatedSection animation="fade" duration={600}>
          <h2 className="text-[40px] md:text-[32px] sm:text-[32px] font-bold mb-16 text-center">
            Built on Strong Foundations
          </h2>
        </AnimatedSection>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {values.map((value, index) => (
            <AnimatedSection
              key={value.name}
              animation="slide-up"
              delay={index * 100}
              duration={600}
            >
              <div className="relative">
                {/* Subtle top divider */}
                <div className="absolute top-0 left-0 w-16 h-[2px] bg-primary/20" />

                <div className="pt-6">
                  {/* Value name */}
                  <h3 className="text-[20px] font-semibold mb-3">
                    {value.name}
                  </h3>

                  {/* Description */}
                  <p className="text-[16px] text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
