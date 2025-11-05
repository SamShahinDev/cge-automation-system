import { Search, Code, Rocket, TrendingUp } from 'lucide-react';

const processSteps = [
  {
    phase: 1,
    title: "Discovery",
    duration: "2 weeks",
    description: "We learn everything about your business",
    icon: Search,
  },
  {
    phase: 2,
    title: "Development",
    duration: "4-8 weeks",
    description: "We build your custom solution",
    icon: Code,
  },
  {
    phase: 3,
    title: "Launch",
    duration: "1 week",
    description: "We deploy and train your team",
    icon: Rocket,
  },
  {
    phase: 4,
    title: "Evolution",
    duration: "Ongoing",
    description: "We help your software grow",
    icon: TrendingUp,
  },
];

export function ProcessOverview() {
  return (
    <section className="container-width py-20 lg:py-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {processSteps.map((step) => (
          <div key={step.phase} className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">
                Phase {step.phase} • {step.duration}
              </p>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
