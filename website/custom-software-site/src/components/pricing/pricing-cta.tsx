import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PricingCTA() {
  return (
    <section className="w-full bg-primary text-primary-foreground py-20 lg:py-24">
      <div className="container-width">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Ready to Build Something Great?
          </h2>

          <p className="text-xl lg:text-2xl opacity-90">
            Get a custom quote for your project in 48 hours
          </p>

          <Button
            asChild
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6 h-auto group active:scale-95 transition-transform"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <Link href="/start" className="flex items-center gap-2">
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <p className="text-sm opacity-80">
            No spam, no pressure. Just honest pricing and expert guidance.
          </p>
        </div>
      </div>
    </section>
  );
}
