import { Wrench, Calendar, Key } from "lucide-react";

export function PricingModel() {
  const pricingColumns = [
    {
      icon: Wrench,
      title: "One-Time Setup Fee",
      description: "Covers discovery, design, and initial development",
    },
    {
      icon: Calendar,
      title: "Monthly Subscription",
      description: "Predictable monthly cost for hosting, support, and updates",
    },
    {
      icon: Key,
      title: "Full Ownership",
      description: "You own all code and intellectual property",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="text-center text-[36px] md:text-[36px] sm:text-[28px] font-bold mb-12">
          How Our Pricing Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingColumns.map((column, index) => {
            const IconComponent = column.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <IconComponent className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-[20px] font-semibold mb-3">
                  {column.title}
                </h3>
                <p className="text-[16px] text-muted-foreground">
                  {column.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
