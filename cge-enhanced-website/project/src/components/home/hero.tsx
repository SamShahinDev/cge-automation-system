'use client'

import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background with gradient */}
      <div className="absolute inset-0 -z-10">
        {/* Radial gradient background */}
        <div
          className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"
          style={{
            background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.05) 0%, transparent 50%)'
          }}
        />

        {/* Floating gradient orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"
          style={{
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-delayed"
          style={{
            animation: 'float 25s ease-in-out infinite 5s',
          }}
        />
      </div>

      {/* Content */}
      <div className="w-full max-w-4xl mx-auto text-center animate-fade-in">
        {/* Headline */}
        <h1
          className="text-[48px] sm:text-5xl md:text-6xl lg:text-[72px] font-bold leading-tight"
          style={{ letterSpacing: '-0.02em' }}
        >
          Custom Software. Monthly Subscription. No Complexity.
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-xl sm:text-2xl text-muted-foreground max-w-[600px] mx-auto">
          We build software that works exactly how your business works.
        </p>

        {/* CTA Button */}
        <div className="mt-10">
          <Button
            size="lg"
            className="w-full sm:w-auto text-base px-8 py-6 h-auto"
          >
            Start Your Project
          </Button>
        </div>

        {/* Value Props Strip */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2 text-sm font-medium text-foreground/80">
          <span>Setup from $2,000</span>
          <span className="hidden sm:inline text-muted-foreground">•</span>
          <span>Monthly from $500</span>
          <span className="hidden sm:inline text-muted-foreground">•</span>
          <span>You Own Everything</span>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 25s ease-in-out infinite 5s;
        }
      `}</style>
    </section>
  )
}
