'use client'

export function AboutHero() {
  return (
    <section className="relative h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Dark background with subtle texture */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-foreground via-foreground to-foreground/95">
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Animated morphing shape - represents adaptability */}
      <div className="absolute inset-0 -z-5 flex items-center justify-center">
        <div className="morph-shape" />
      </div>

      {/* Content */}
      <div className="w-full max-w-5xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h1
          className="text-[48px] lg:text-[64px] font-bold leading-[1.1] text-background"
          style={{ letterSpacing: '-0.02em' }}
        >
          Software Should Adapt to You
        </h1>

        {/* Subheading */}
        <p className="mt-4 text-[24px] lg:text-[32px] text-background/80 font-medium">
          Not the other way around
        </p>
      </div>

      {/* CSS Animations and styles */}
      <style jsx>{`
        @keyframes morph {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: translate(30px, -20px) rotate(90deg) scale(1.05);
          }
          50% {
            border-radius: 50% 50% 30% 60% / 40% 50% 60% 50%;
            transform: translate(-20px, 30px) rotate(180deg) scale(0.95);
          }
          75% {
            border-radius: 40% 50% 60% 50% / 70% 40% 50% 40%;
            transform: translate(20px, 20px) rotate(270deg) scale(1.02);
          }
        }

        .morph-shape {
          width: 500px;
          height: 500px;
          background: hsl(var(--primary) / 0.08);
          filter: blur(40px);
          animation: morph 20s ease-in-out infinite;
          will-change: border-radius, transform;
        }

        @media (max-width: 1024px) {
          .morph-shape {
            width: 400px;
            height: 400px;
            filter: blur(35px);
          }
        }

        @media (max-width: 640px) {
          .morph-shape {
            width: 320px;
            height: 320px;
            filter: blur(30px);
          }
        }
      `}</style>
    </section>
  )
}
