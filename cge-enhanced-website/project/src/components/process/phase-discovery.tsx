"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const activities = [
  "Stakeholder interviews",
  "Workflow documentation",
  "Pain point analysis",
  "Technical architecture planning",
  "Success metrics definition",
];

const deliverables = [
  "Project roadmap",
  "Technical spec",
  "Fixed quote",
];

export default function PhaseDiscovery() {
  return (
    <section className="w-full min-h-screen bg-background flex items-center py-16 md:py-0">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left side - Content */}
          <AnimatedSection animation="slide-right" delay={100}>
            <div className="space-y-8">
              {/* Phase indicator */}
              <div className="inline-block">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Phase 1
                </span>
              </div>

              {/* Heading */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Discovery
                </h2>
                <p className="text-xl text-muted-foreground">
                  Timeline: <span className="font-semibold text-foreground">2 weeks</span>
                </p>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed">
                We become experts in your business
              </p>

              {/* Activities list */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Activities</h3>
                <ul className="space-y-3">
                  {activities.map((activity, index) => (
                    <AnimatedSection
                      key={activity}
                      animation="slide-right"
                      delay={200 + index * 100}
                    >
                      <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-base text-foreground">{activity}</span>
                      </li>
                    </AnimatedSection>
                  ))}
                </ul>
              </div>

              {/* Deliverables box */}
              <AnimatedSection animation="slide-up" delay={400}>
                <Card className="bg-muted border-none">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">What you get:</h3>
                    <ul className="space-y-2">
                      {deliverables.map((deliverable) => (
                        <li key={deliverable} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-base text-foreground">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </AnimatedSection>

          {/* Right side - Visual */}
          <AnimatedSection animation="slide-left" delay={200}>
            <div className="relative">
              {/* Card grid showing discovery activities */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "👥", label: "Interviews", color: "bg-blue-50 dark:bg-blue-950" },
                  { icon: "📋", label: "Documentation", color: "bg-purple-50 dark:bg-purple-950" },
                  { icon: "🔍", label: "Analysis", color: "bg-green-50 dark:bg-green-950" },
                  { icon: "🏗️", label: "Planning", color: "bg-orange-50 dark:bg-orange-950" },
                  { icon: "📊", label: "Metrics", color: "bg-pink-50 dark:bg-pink-950" },
                  { icon: "🎯", label: "Roadmap", color: "bg-indigo-50 dark:bg-indigo-950" },
                ].map((item, index) => (
                  <AnimatedSection
                    key={item.label}
                    animation="scale"
                    delay={300 + index * 100}
                  >
                    <Card className={`${item.color} border-none hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
                        <span className="text-3xl mb-2">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                ))}
              </div>

              {/* Abstract decoration */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10" />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
