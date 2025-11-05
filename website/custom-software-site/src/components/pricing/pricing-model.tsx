'use client';

import { Settings, Calendar, Key } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const pricingModels = [
  {
    icon: Settings,
    title: "One-Time Setup Fee",
    description: "Covers discovery, design, and initial development of your custom solution"
  },
  {
    icon: Calendar,
    title: "Monthly Subscription",
    description: "Predictable monthly cost for hosting, support, updates, and improvements"
  },
  {
    icon: Key,
    title: "Full Ownership",
    description: "You own all code and intellectual property. No vendor lock-in, ever"
  }
];

export function PricingModel() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`container-width py-20 lg:py-24 transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="mx-auto max-w-4xl">
        {/* Section Heading */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            How Our Pricing Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent pricing with no surprises
          </p>
        </div>

        {/* Three-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {pricingModels.map((model) => (
            <div key={model.title} className="text-center space-y-4">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <model.icon className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {model.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {model.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
