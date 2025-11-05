"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Sparkles, Shield, TrendingUp } from "lucide-react";

const supportColumns = [
  {
    icon: Sparkles,
    title: "Continuous Improvement",
    features: [
      "Regular feature updates",
      "Performance optimization",
      "User feedback implementation",
    ],
  },
  {
    icon: Shield,
    title: "Reliable Support",
    features: [
      "Bug fixes included",
      "Technical support",
      "Security updates",
    ],
  },
  {
    icon: TrendingUp,
    title: "Future Growth",
    features: [
      "Scalability planning",
      "New integrations",
      "Feature roadmapping",
    ],
  },
];

export default function PhaseEvolution() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-primary to-[hsl(214,54%,30%)] py-16">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <AnimatedSection animation="fade-in" delay={100}>
            <div className="text-center space-y-6 mb-16">
              {/* Phase indicator */}
              <div className="inline-block">
                <span className="text-sm font-semibold text-white uppercase tracking-wider">
                  Phase 4
                </span>
              </div>

              {/* Heading */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Evolution
                </h2>
                <p className="text-xl text-white">
                  Timeline: <span className="font-semibold">Ongoing</span>
                </p>
              </div>

              {/* Description */}
              <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                Your software grows with your business
              </p>
            </div>
          </AnimatedSection>

          {/* Three Columns of Support */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {supportColumns.map((column, index) => {
              const Icon = column.icon;
              return (
                <AnimatedSection
                  key={column.title}
                  animation="slide-up"
                  delay={200 + index * 100}
                >
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                    <CardContent className="p-6 space-y-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-white">
                        {column.title}
                      </h3>

                      {/* Features list */}
                      <ul className="space-y-3">
                        {column.features.map((feature, featureIndex) => (
                          <AnimatedSection
                            key={feature}
                            animation="slide-right"
                            delay={300 + index * 100 + featureIndex * 50}
                          >
                            <li className="flex items-start gap-2 text-white/90">
                              <span className="text-white/70 mt-1.5">•</span>
                              <span className="text-base leading-relaxed">{feature}</span>
                            </li>
                          </AnimatedSection>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <AnimatedSection animation="slide-up" delay={500}>
            <div className="text-center space-y-6">
              <p className="text-lg text-white/90 font-medium">
                All included in your monthly subscription
              </p>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-primary hover:bg-white/90 border-white text-base px-8 py-6 h-auto"
              >
                See Pricing
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
