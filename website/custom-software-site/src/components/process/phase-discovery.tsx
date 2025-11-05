'use client';

import { CheckCircle } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

const activities = [
  "Stakeholder interviews",
  "Workflow documentation",
  "Pain point analysis",
  "Technical architecture planning",
  "Success metrics definition",
];

const deliverables = [
  "Project roadmap",
  "Technical specification",
  "Fixed quote with timeline",
];

export function PhaseDiscovery() {
  const { ref, isIntersecting: isInView } = useIntersectionObserver({ threshold: 0.3 });

  return (
    <section className="min-h-screen flex items-center py-20" ref={ref}>
      <div className="container-width">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className={`
            space-y-8 transition-all duration-1000
            ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}
          `}>
            <div className="space-y-4">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">
                Phase 1
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold">Discovery</h2>
              <p className="text-xl text-muted-foreground">2 weeks</p>
              <p className="text-lg">We become experts in your business</p>
            </div>

            {/* Activities */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">What we do:</h3>
              <ul className="space-y-3">
                {activities.map((activity, index) => (
                  <li
                    key={activity}
                    className={`
                      flex items-center gap-3 transition-all duration-500
                      ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}
                    `}
                    style={{ transitionDelay: `${index * 100 + 200}ms` }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables */}
            <div className="bg-muted rounded-lg p-6 space-y-4">
              <h3 className="font-semibold">What you get:</h3>
              <ul className="space-y-2">
                {deliverables.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Visual */}
          <div className={`
            transition-all duration-1000 delay-300
            ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}>
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-background/50 backdrop-blur rounded-lg p-4 h-24"
                    style={{
                      animationDelay: `${i * 200}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
