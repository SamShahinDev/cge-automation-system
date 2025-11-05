import React from 'react';
import { Search, Code, Rocket, TrendingUp } from 'lucide-react';

interface PhaseCard {
  phase: string;
  title: string;
  description: string;
  timeline: string;
  icon: React.ReactNode;
}

const phases: PhaseCard[] = [
  {
    phase: 'Phase 1',
    title: 'Discovery',
    description: 'We learn everything about your business',
    timeline: '2 weeks',
    icon: <Search size={48} className="text-primary" />,
  },
  {
    phase: 'Phase 2',
    title: 'Development',
    description: 'We build your custom solution',
    timeline: '4-8 weeks',
    icon: <Code size={48} className="text-primary" />,
  },
  {
    phase: 'Phase 3',
    title: 'Launch',
    description: 'We deploy and train your team',
    timeline: '1 week',
    icon: <Rocket size={48} className="text-primary" />,
  },
  {
    phase: 'Phase 4',
    title: 'Evolution',
    description: 'We help your software grow',
    timeline: 'Ongoing',
    icon: <TrendingUp size={48} className="text-primary" />,
  },
];

export function ProcessOverview() {
  return (
    <section className="py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {phases.map((phase, index) => (
            <div key={index} className="flex flex-col items-start space-y-4">
              <div className="flex-shrink-0">{phase.icon}</div>

              <div className="space-y-2">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  {phase.phase}
                </p>

                <h3 className="text-xl font-bold">{phase.title}</h3>

                <p className="text-base text-muted-foreground">
                  {phase.description}
                </p>

                <p className="text-sm font-medium text-primary">
                  {phase.timeline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
