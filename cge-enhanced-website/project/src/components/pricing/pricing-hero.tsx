"use client";

import { Check } from 'lucide-react';
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

export function PricingHero() {
  const trustBadges = [
    'No Hidden Fees',
    'Month-to-Month After Initial Term',
    'You Own The Code',
  ];

  const [users, setUsers] = useState([10]);

  // Calculate estimated costs based on users
  const calculateCosts = (userCount: number) => {
    if (userCount <= 5) {
      return { tier: 'Simple Systems', setup: 2000, monthly: 500 };
    } else if (userCount <= 25) {
      return { tier: 'Standard Business Apps', setup: 5000, monthly: 950 };
    } else {
      return { tier: 'Complex Platforms', setup: 8000, monthly: 1500 };
    }
  };

  const costs = calculateCosts(users[0]);

  return (
    <section id="hero" className="relative min-h-[500px] flex items-center justify-center bg-gradient-to-b from-primary/5 to-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Headline */}
          <h1 className="text-[36px] md:text-[48px] font-bold leading-tight mb-6">
            Transparent Pricing. No Surprises.
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mb-8">
            Custom software shouldn't cost more than your annual revenue
          </p>

          {/* Pricing Calculator */}
          <Card className="w-full max-w-md p-6 mb-8 bg-card/50 backdrop-blur">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-4 block">
                  Number of Users
                </label>
                <Slider
                  value={users}
                  onValueChange={setUsers}
                  min={1}
                  max={50}
                  step={1}
                  className="mb-2"
                />
                <div className="text-center text-2xl font-bold text-primary">
                  {users[0]} {users[0] === 1 ? 'user' : 'users'}
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="text-sm text-muted-foreground">
                  Recommended Tier
                </div>
                <div className="text-xl font-semibold">{costs.tier}</div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Setup</div>
                    <div className="text-lg font-bold">${costs.setup.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Monthly</div>
                    <div className="text-lg font-bold">${costs.monthly}/mo</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {trustBadges.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
