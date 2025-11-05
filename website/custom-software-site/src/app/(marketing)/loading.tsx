import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export default function Loading() {
  return (
    <div className="flex-1">
      {/* Hero Skeleton */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 md:pt-20 pb-16">
        <div className="container-width relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Headline skeleton */}
            <Skeleton className="h-16 md:h-20 w-full max-w-3xl mx-auto" />
            <Skeleton className="h-16 md:h-20 w-4/5 max-w-2xl mx-auto" />

            {/* Subheading skeleton */}
            <Skeleton className="h-8 w-3/4 max-w-xl mx-auto mt-8" />

            {/* Button skeleton */}
            <Skeleton className="h-12 w-48 mx-auto mt-10" />

            {/* Value props skeleton */}
            <div className="flex justify-center gap-6 mt-16">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
      </section>

      {/* What We Build Skeleton */}
      <section className="section-padding bg-background">
        <div className="container-width max-w-6xl">
          {/* Section header skeleton */}
          <div className="text-center mb-16 space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          {/* Cards grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-border rounded-lg p-8 space-y-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-6 w-6 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Skeleton */}
      <section className="section-padding bg-muted">
        <div className="container-width max-w-5xl">
          {/* Section header skeleton */}
          <div className="text-center mb-16 space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          {/* Timeline skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}