'use client';

import { useEffect, useState } from 'react';

export function ProcessHero() {
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const phases = ['Discover', 'Build', 'Launch', 'Grow'];

  return (
    <section className="relative w-full bg-foreground text-background py-32 lg:py-40 overflow-hidden">
      <div className="container-width">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Complex Problems. Simple Process.
          </h1>

          <p className="text-xl lg:text-2xl opacity-80">
            From idea to launch in 4-12 weeks
          </p>

          {/* Animated Timeline */}
          <div className="flex items-center justify-center gap-4 mt-12">
            {phases.map((phase, index) => (
              <div key={phase} className="flex items-center">
                <div className="relative">
                  <div
                    className={`
                      w-3 h-3 rounded-full transition-all duration-500
                      ${activePhase === index
                        ? 'bg-primary scale-150'
                        : 'bg-background/40'
                      }
                    `}
                  />
                  {activePhase === index && (
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping" />
                  )}
                </div>
                {index < phases.length - 1 && (
                  <div className="w-16 h-0.5 bg-background/20 ml-4" />
                )}
                <span className={`
                  ml-4 text-sm transition-opacity duration-500
                  ${activePhase === index ? 'opacity-100' : 'opacity-40'}
                `}>
                  {phase}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
