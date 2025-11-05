"use client";

import { cn } from '@/lib/utils';

interface StartHeroProps {
  currentStep?: number;
  totalSteps?: number;
}

export function StartHero({ currentStep = 0, totalSteps = 5 }: StartHeroProps) {
  return (
    <section
      className="relative h-[300px] flex items-center justify-center bg-gradient-to-b from-primary/5 to-transparent"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Headline */}
          <h1 className="text-[36px] md:text-[48px] font-bold leading-tight">
            Let's Build Your Solution
          </h1>

          {/* Subheading */}
          <p className="text-[20px] text-muted-foreground mt-4">
            Get a custom quote in 48 hours
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-8" role="progressbar" aria-valuenow={currentStep} aria-valuemin={0} aria-valuemax={totalSteps}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors duration-300",
                  index < currentStep
                    ? "bg-primary"
                    : "bg-muted"
                )}
                aria-label={`Step ${index + 1}${index < currentStep ? ' completed' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
