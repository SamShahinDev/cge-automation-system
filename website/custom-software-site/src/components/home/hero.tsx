"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  const [mounted, setMounted] = useState(true); // Changed to true for immediate visibility
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  const valueProps = [
    "Setup from $2,000",
    "Monthly from $500",
    "You Own Everything"
  ];

  // Mouse move effect for gradient orbs
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20; // Max 20px movement
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNextSection = () => {
    const nextSection = document.querySelector('#what-we-build');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className={cn(
        "relative min-h-screen flex items-center justify-center",
        "pt-16 md:pt-20 pb-16",
        "overflow-hidden",
        className
      )}
      style={{ minHeight: '600px' }}
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(circle at 50% 50%, hsl(214 54% 41% / 0.08) 0%, transparent 60%)',
        }}
      />

      {/* Floating gradient orbs with parallax and mouse interaction */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className={cn(
            "absolute -top-40 -left-40 w-80 h-80 rounded-full",
            "bg-primary/[0.15] blur-3xl",
            "gpu-accelerated"
          )}
          style={{
            animationName: mounted ? 'float' : 'none',
            animationDuration: '30s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0s',
            transform: `translate3d(${mousePosition.x}px, ${mousePosition.y + scrollY * 0.3}px, 0)`,
            transition: 'transform 0.3s ease-out',
            willChange: mounted ? 'transform' : 'auto'
          }}
        />
        <div
          className={cn(
            "absolute -bottom-40 -right-40 w-96 h-96 rounded-full",
            "bg-primary/[0.12] blur-3xl",
            "gpu-accelerated"
          )}
          style={{
            animationName: mounted ? 'float-reverse' : 'none',
            animationDuration: '25s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '5s',
            transform: `translate3d(${-mousePosition.x}px, ${-mousePosition.y + scrollY * 0.5}px, 0)`,
            transition: 'transform 0.3s ease-out',
            willChange: mounted ? 'transform' : 'auto'
          }}
        />
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full",
            "bg-primary/[0.1] blur-3xl",
            "gpu-accelerated"
          )}
          style={{
            animationName: mounted ? 'float' : 'none',
            animationDuration: '20s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '10s',
            transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5 + scrollY * 0.4}px, 0)`,
            transition: 'transform 0.3s ease-out',
            willChange: mounted ? 'transform' : 'auto'
          }}
        />
      </div>

      {/* Content container */}
      <div className="container-width relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <h1
            className={cn(
              "hero-headline",
              "font-bold tracking-tight leading-tight",
              "text-foreground",
              "transition-all duration-700 ease-out",
              "gpu-accelerated",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{
              textShadow: '0 1px 3px rgba(0,0,0,0.1)',
              willChange: mounted ? 'auto' : 'transform, opacity'
            }}
          >
            Custom Software.
            <br />
            Monthly Subscription.
            <br />
            No Complexity.
          </h1>

          {/* Subheading */}
          <p
            className={cn(
              "mt-6 text-xl md:text-2xl body-responsive",
              "text-muted-foreground",
              "max-w-[600px] mx-auto",
              "transition-all duration-700 ease-out delay-200",
              "gpu-accelerated",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{
              willChange: mounted ? 'auto' : 'transform, opacity'
            }}
          >
            We build software that works exactly how your business works.
          </p>

          {/* CTA Button */}
          <div
            className={cn(
              "mt-10",
              "transition-all duration-700 ease-out delay-300",
              "gpu-accelerated",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{
              willChange: mounted ? 'auto' : 'transform, opacity'
            }}
          >
            <Button
              asChild
              size="lg"
              className={cn(
                "px-8 py-6 text-base md:text-lg",
                "w-full sm:w-auto min-h-[48px]",
                "button-base touch-feedback",
                "shadow-lg hover:shadow-xl"
              )}
            >
              <Link href="/start">Start Your Project</Link>
            </Button>
          </div>

          {/* Value proposition strip */}
          <div
            className={cn(
              "mt-16",
              "transition-all duration-700 ease-out delay-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {/* Desktop: Horizontal with bullets */}
            <div className="hidden sm:flex items-center justify-center gap-6 flex-wrap">
              {valueProps.map((prop, index) => (
                <span key={prop} className="flex items-center gap-6">
                  <span className="text-sm md:text-base font-medium text-muted-foreground">
                    {prop}
                  </span>
                  {index < valueProps.length - 1 && (
                    <span className="text-muted-foreground/50">•</span>
                  )}
                </span>
              ))}
            </div>

            {/* Mobile: Vertical stack */}
            <div className="flex sm:hidden flex-col items-center gap-2">
              {valueProps.map((prop) => (
                <span key={prop} className="text-sm font-medium text-muted-foreground">
                  {prop}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToNextSection}
          className={cn(
            "absolute bottom-8 left-1/2 -translate-x-1/2",
            "text-muted-foreground hover:text-primary",
            "transition-all duration-700 ease-out delay-700",
            "motion-safe:animate-bounce",
            "min-h-[48px] min-w-[48px] touch-feedback",
            "gpu-accelerated",
            mounted ? "opacity-100" : "opacity-0"
          )}
          aria-label="Scroll to next section"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-30px) translateX(20px);
          }
          50% {
            transform: translateY(20px) translateX(-10px);
          }
          75% {
            transform: translateY(-20px) translateX(-20px);
          }
        }

        @keyframes float-reverse {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(30px) translateX(-20px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          75% {
            transform: translateY(20px) translateX(20px);
          }
        }
      `}</style>
    </section>
  );
}