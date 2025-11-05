import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TierFeature {
  text: string;
  included: boolean;
}

interface Tier {
  name: string;
  description: string;
  setupFee: string;
  monthlyPayment: string;
  totalInvestment: string;
  features: TierFeature[];
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Starter",
    description: "Perfect for MVPs and simple applications",
    setupFee: "$2,000",
    monthlyPayment: "$200 - $500",
    totalInvestment: "$5,000 - $10,000",
    features: [
      { text: "Up to 5 core features", included: true },
      { text: "Responsive web design", included: true },
      { text: "Basic user authentication", included: true },
      { text: "Database setup", included: true },
      { text: "12-month payment plan", included: true },
      { text: "Hosting & maintenance included", included: true },
      { text: "API integrations (limited)", included: false },
      { text: "Custom admin dashboard", included: false },
    ],
  },
  {
    name: "Professional",
    description: "Full-featured applications for growing businesses",
    setupFee: "$3,500",
    monthlyPayment: "$500 - $1,200",
    totalInvestment: "$15,000 - $30,000",
    features: [
      { text: "Up to 15 core features", included: true },
      { text: "Advanced responsive design", included: true },
      { text: "Role-based authentication", included: true },
      { text: "Complex database architecture", included: true },
      { text: "12-24 month payment plan", included: true },
      { text: "Hosting & maintenance included", included: true },
      { text: "Multiple API integrations", included: true },
      { text: "Custom admin dashboard", included: true },
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Complex systems and custom solutions",
    setupFee: "$5,000+",
    monthlyPayment: "$1,200 - $2,000+",
    totalInvestment: "$30,000+",
    features: [
      { text: "Unlimited core features", included: true },
      { text: "Custom UI/UX design", included: true },
      { text: "Advanced security features", included: true },
      { text: "Scalable architecture", included: true },
      { text: "Flexible payment terms", included: true },
      { text: "Hosting & maintenance included", included: true },
      { text: "Extensive API integrations", included: true },
      { text: "Multiple admin dashboards", included: true },
    ],
  },
];

export function InvestmentTiers() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Investment Ranges
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the tier that matches your project scope. All tiers include
            full code ownership and ongoing support during the payment period.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                "relative bg-card border rounded-lg p-6 lg:p-8 shadow-sm transition-all duration-200 hover:shadow-md",
                tier.highlighted
                  ? "border-primary ring-2 ring-primary/20 md:scale-105"
                  : "border-border"
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Setup Fee
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {tier.setupFee}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Monthly Payment
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {tier.monthlyPayment}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Investment
                  </p>
                  <p className="text-lg font-medium text-primary">
                    {tier.totalInvestment}
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check
                      className={cn(
                        "h-5 w-5 flex-shrink-0 mt-0.5",
                        feature.included
                          ? "text-primary"
                          : "text-muted-foreground/30"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground line-through"
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.highlighted ? "default" : "outline"}
                className="w-full"
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            All prices are estimates. Final pricing depends on project
            complexity and specific requirements.
          </p>
        </div>
      </div>
    </section>
  );
}
