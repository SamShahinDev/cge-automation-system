"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Users, Zap, Building2 } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface WhatWeBuildProps {
  className?: string;
}

interface Capability {
  id: string;
  title: string;
  description: string;
  examples?: string[];
  icon: React.ReactNode;
}

export function WhatWeBuild({ className }: WhatWeBuildProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true
  });

  const capabilities: Capability[] = [
    {
      id: 'crm',
      title: 'Customer Management Systems',
      description: 'Track customers, sales, and relationships exactly how you need',
      examples: ['Contact databases', 'Sales pipelines', 'Client portals'],
      icon: <Users className="h-6 w-6 text-primary" />
    },
    {
      id: 'tools',
      title: 'Internal Tools & Dashboards',
      description: 'Custom dashboards and tools for your team\'s unique workflow',
      examples: ['Admin panels', 'Analytics dashboards', 'Reporting tools'],
      icon: <CheckCircle2 className="h-6 w-6 text-primary" />
    },
    {
      id: 'automation',
      title: 'Workflow Automation',
      description: 'Automate repetitive tasks with software built for your process',
      examples: ['Data processing', 'Email automation', 'Integration workflows'],
      icon: <Zap className="h-6 w-6 text-primary" />
    },
    {
      id: 'industry',
      title: 'Industry-Specific Solutions',
      description: 'Specialized solutions for healthcare, manufacturing, and more',
      examples: ['Medical records', 'Inventory systems', 'Compliance tools'],
      icon: <Building2 className="h-6 w-6 text-primary" />
    }
  ];

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Trigger staggered card animations when section intersects
  useEffect(() => {
    if (isIntersecting && sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll('.capability-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate-in');
        }, index * 100);
      });
    }
  }, [isIntersecting]);

  const handleCardInteraction = (id: string, isHover: boolean) => {
    if (!isMobile) {
      setHoveredCard(isHover ? id : null);
    }
  };

  return (
    <section
      id="what-we-build"
      ref={sectionRef}
      className={cn("section-padding bg-background", className)}
    >
      <div className="container-width max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            What We Build
          </h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Solutions tailored to your business needs
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 contain-layout">
          {capabilities.map((capability, index) => (
            <Card
              key={capability.id}
              className={cn(
                "capability-card cursor-pointer border-border",
                "transition-all duration-300 ease-out",
                "hover:scale-[1.02] hover:shadow-lg hover:border-primary/20",
                "focus-within:scale-[1.02] focus-within:shadow-lg focus-within:border-primary/20",
                "opacity-0 translate-y-4",
                "p-8 min-h-[48px]",
                "touch-feedback gpu-accelerated"
              )}
              style={{
                transitionDelay: `${index * 50}ms`,
                willChange: isIntersecting ? 'auto' : 'transform, opacity'
              }}
              onMouseEnter={() => handleCardInteraction(capability.id, true)}
              onMouseLeave={() => handleCardInteraction(capability.id, false)}
              onFocus={() => handleCardInteraction(capability.id, true)}
              onBlur={() => handleCardInteraction(capability.id, false)}
              tabIndex={0}
              role="article"
              aria-label={capability.title}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {capability.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-3">
                    {capability.title}
                  </h3>

                  {/* Description */}
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {capability.description}
                  </p>

                  {/* Examples - Show on hover or always on mobile */}
                  {capability.examples && (
                    <div
                      className={cn(
                        "mt-4 space-y-2",
                        "transition-all duration-300 ease-out",
                        isMobile || hoveredCard === capability.id
                          ? "opacity-100 max-h-32"
                          : "opacity-0 max-h-0 overflow-hidden"
                      )}
                    >
                      <p className="text-sm font-medium text-muted-foreground">
                        Examples:
                      </p>
                      <ul className="space-y-1">
                        {capability.examples.map((example) => (
                          <li
                            key={example}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Optional CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Don&apos;t see what you need? We build custom solutions for any business challenge.
          </p>
          <a
            href="/start"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors min-h-[48px] touch-feedback"
            aria-label="View all our capabilities"
          >
            Explore all capabilities
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        .capability-card.animate-in {
          animation: fadeInUp 0.6s ease forwards;
          opacity: 1;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .capability-card {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}