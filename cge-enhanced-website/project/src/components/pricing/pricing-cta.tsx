import { Button } from "@/components/ui/button";

export function PricingCTA() {
  return (
    <section id="cta" data-section="cta" className="w-full bg-primary py-20">
      <div className="container mx-auto px-4 text-center">
        {/* Headline */}
        <h2 className="text-[28px] md:text-[36px] font-bold text-white mb-4">
          Ready to Build Something Great?
        </h2>

        {/* Subheading */}
        <p className="text-[20px] text-white/90 mb-8">
          Get a custom quote for your project in 48 hours
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          className="bg-white text-primary hover:bg-white hover:scale-105 transition-transform duration-200 mb-4"
        >
          Start Your Project
        </Button>

        {/* Trust Text */}
        <p className="text-[14px] text-white/80">
          No spam, no pressure. Just honest pricing.
        </p>
      </div>
    </section>
  );
}
