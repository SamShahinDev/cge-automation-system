'use client';

import { useEffect, useState } from 'react';

const timelineSteps = [
  { label: 'Discover', delay: 0 },
  { label: 'Build', delay: 200 },
  { label: 'Launch', delay: 400 },
  { label: 'Grow', delay: 600 },
];

export default function ProcessHero() {
  const [animatedSteps, setAnimatedSteps] = useState<number[]>([]);

  useEffect(() => {
    timelineSteps.forEach((step, index) => {
      setTimeout(() => {
        setAnimatedSteps((prev) => [...prev, index]);
      }, step.delay);
    });
  }, []);

  return (
    <section className="relative h-[500px] bg-foreground text-background flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        {/* Headline */}
        <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] leading-tight">
          Complex Problems. Simple Process.
        </h1>

        {/* Subheading */}
        <p className="text-[20px] md:text-[24px] opacity-80 mt-6">
          From idea to launch in 4-12 weeks
        </p>

        {/* Animated Timeline */}
        <div className="mt-16 max-w-3xl mx-auto">
          {/* Timeline container */}
          <div className="relative flex items-center justify-between">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-6 h-[2px] bg-background/20 -z-10" />

            {/* Animated progress line */}
            <div
              className="absolute left-0 top-6 h-[2px] bg-background transition-all duration-1000 ease-out -z-10"
              style={{
                width: animatedSteps.length > 0
                  ? `${(animatedSteps.length / (timelineSteps.length - 1)) * 100}%`
                  : '0%'
              }}
            />

            {/* Timeline steps */}
            {timelineSteps.map((step, index) => (
              <div key={step.label} className="flex flex-col items-center">
                {/* Dot */}
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    animatedSteps.includes(index)
                      ? 'bg-background border-background scale-100 opacity-100'
                      : 'bg-transparent border-background/20 scale-75 opacity-40'
                  }`}
                >
                  {animatedSteps.includes(index) && (
                    <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`mt-4 text-sm md:text-base font-medium transition-all duration-500 ${
                    animatedSteps.includes(index)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2'
                  }`}
                >
                  {step.label}
                </span>

                {/* Arrow between steps */}
                {index < timelineSteps.length - 1 && (
                  <div
                    className={`absolute left-[${(index + 0.5) * 25}%] top-6 text-background/40 transition-opacity duration-500 hidden md:block ${
                      animatedSteps.includes(index + 1) ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
