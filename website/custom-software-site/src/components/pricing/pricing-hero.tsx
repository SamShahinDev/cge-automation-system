import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PricingHeroProps {
  className?: string;
}

export function PricingHero({ className }: PricingHeroProps) {
  const trustBadges = [
    'No Hidden Fees',
    'Month-to-Month After Initial Term',
    'You Own The Code'
  ];

  return (
    <section
      className={cn(
        "relative h-[400px] flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-primary/5 via-primary/3 to-transparent",
        className
      )}
    >
      {/* Background Pattern - subtle dots or grid */}
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />

      {/* Content Container */}
      <div className="container-width text-center">
        <div className="max-w-3xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 animate-in fade-in-up duration-500">
            Transparent Pricing. No Surprises.
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-[600px] mx-auto mb-8 animate-in fade-in-up duration-500 animation-delay-200">
            Custom software shouldn&apos;t cost more than your annual revenue
          </p>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 animate-in fade-in-up duration-500 animation-delay-400">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
