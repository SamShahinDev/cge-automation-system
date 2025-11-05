"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, Code, CreditCard, CheckCircle, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HowItWorksProps {
  className?: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
  duration?: string;
  icon?: LucideIcon;
}

export function HowItWorks({ className }: HowItWorksProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const steps: Step[] = [
    {
      number: 1,
      title: "We Learn Your Business",
      description: "Deep dive into your workflows, pain points, and specific needs to design the perfect solution",
      duration: "1-2 weeks",
      icon: Search
    },
    {
      number: 2,
      title: "We Build Your Solution",
      description: "Custom software crafted for your exact requirements with continuous feedback and iterations",
      duration: "4-8 weeks",
      icon: Code
    },
    {
      number: 3,
      title: "You Pay Monthly, Own Forever",
      description: "Affordable monthly payments with no huge upfront costs. You own the code completely",
      duration: "Ongoing",
      icon: CreditCard
    }
  ];

  // Intersection Observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Scroll progress tracking with requestAnimationFrame debounce
  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      if (!sectionRef.current) {
        ticking = false;
        return;
      }

      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = rect.height;
      const sectionTop = rect.top;
      const windowHeight = window.innerHeight;

      // Calculate progress through the section
      const scrollProgress = Math.max(0, Math.min(1,
        (windowHeight - sectionTop) / (windowHeight + sectionHeight)
      ));

      // Update active step based on scroll progress
      const newActiveStep = Math.min(
        steps.length - 1,
        Math.floor(scrollProgress * steps.length + 0.5)
      );

      setActiveStep(newActiveStep);

      // Update progress bar width
      if (progressRef.current) {
        const progressWidth = (scrollProgress * 100);
        progressRef.current.style.width = `${Math.min(100, progressWidth)}%`;
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [steps.length]);

  const scrollToStep = (stepIndex: number) => {
    const element = document.getElementById(`step-${stepIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className={cn("section-padding bg-muted", className)}
    >
      <div className="container-width max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            From idea to launch in just a few weeks
          </p>
        </div>

        {/* Desktop Horizontal Timeline */}
        <div className="hidden md:block relative">
          {/* Timeline Background Line */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-border z-0" />

          {/* Progress Line */}
          <div className="absolute top-24 left-0 h-0.5 bg-primary z-10 transition-all duration-500 ease-out">
            <div
              ref={progressRef}
              className="h-full bg-primary"
              style={{ width: '0%' }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-3 gap-8 relative z-20">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= activeStep;
              const isCurrentStep = index === activeStep;

              return (
                <div
                  key={step.number}
                  id={`step-${index}`}
                  className={cn(
                    "relative transition-all duration-500",
                    isVisible && `animate-in fade-in-0 slide-in-from-bottom-4`
                  )}
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {/* Number Circle */}
                  <button
                    onClick={() => scrollToStep(index)}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      "border-2 transition-all duration-300 cursor-pointer",
                      "hover:scale-110 focus:scale-110 focus:outline-none",
                      "mx-auto mb-6 min-h-[48px] min-w-[48px]",
                      "touch-feedback gpu-accelerated",
                      isActive
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-border text-foreground",
                      isCurrentStep && "ring-4 ring-primary/20 animate-pulse"
                    )}
                    style={{
                      willChange: isCurrentStep ? 'transform' : 'auto'
                    }}
                    aria-label={`Step ${step.number}: ${step.title}`}
                  >
                    <span className="text-lg font-bold">{step.number}</span>
                  </button>

                  {/* Content Card */}
                  <div
                    className={cn(
                      "bg-background rounded-lg border p-6",
                      "shadow-sm hover:shadow-md transition-all duration-300",
                      "cursor-pointer hover:scale-[1.02] hover:border-primary/20",
                      "touch-feedback gpu-accelerated contain-layout",
                      isCurrentStep && "border-primary/50 shadow-md"
                    )}
                    style={{
                      willChange: isCurrentStep ? 'transform' : 'auto'
                    }}
                    onClick={() => scrollToStep(index)}
                  >
                    {/* Icon */}
                    {Icon && (
                      <Icon className="h-6 w-6 text-primary mb-3" />
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground mb-3">
                      {step.description}
                    </p>

                    {/* Duration */}
                    {step.duration && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {step.duration}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="md:hidden relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border z-0" />

          {/* Progress Line */}
          <div className="absolute left-6 top-0 w-0.5 bg-primary z-10 transition-all duration-500 ease-out">
            <div
              className="w-full bg-primary"
              style={{
                height: `${(activeStep / (steps.length - 1)) * 100}%`,
                transition: 'height 0.5s ease-out'
              }}
            />
          </div>

          {/* Steps */}
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= activeStep;
            const isCurrentStep = index === activeStep;

            return (
              <div
                key={step.number}
                id={`step-mobile-${index}`}
                className={cn(
                  "relative flex items-start mb-12 last:mb-0",
                  "transition-all duration-500",
                  isVisible && `animate-in fade-in-0 slide-in-from-left-4`
                )}
                style={{
                  animationDelay: `${index * 200}ms`,
                  animationFillMode: 'both'
                }}
              >
                {/* Number Circle */}
                <div
                  className={cn(
                    "absolute left-0 w-12 h-12 rounded-full flex items-center justify-center",
                    "border-2 transition-all duration-300 z-20",
                    "gpu-accelerated",
                    isActive
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-foreground",
                    isCurrentStep && "ring-4 ring-primary/20 animate-pulse"
                  )}
                  style={{
                    willChange: isCurrentStep ? 'transform' : 'auto'
                  }}
                >
                  <span className="text-lg font-bold">{step.number}</span>
                </div>

                {/* Content Card */}
                <div className="ml-16 flex-1">
                  <div
                    className={cn(
                      "bg-background rounded-lg border p-5",
                      "shadow-sm transition-all duration-300",
                      "gpu-accelerated contain-layout",
                      isCurrentStep && "border-primary/50 shadow-md"
                    )}
                    style={{
                      willChange: isCurrentStep ? 'transform' : 'auto'
                    }}
                  >
                    {/* Icon */}
                    {Icon && (
                      <Icon className="h-5 w-5 text-primary mb-2" />
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-semibold mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>

                    {/* Duration */}
                    {step.duration && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          {step.duration}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Summary & CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Total timeline: 5-10 weeks from start to launch
            </span>
          </div>

          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to transform your business with custom software that actually fits your needs?
          </p>

          <Button
            asChild
            size="lg"
            className="button-base touch-feedback min-h-[48px]"
          >
            <Link href="/start">
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}