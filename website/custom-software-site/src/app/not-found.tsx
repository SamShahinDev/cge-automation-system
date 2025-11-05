import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container-width max-w-2xl text-center">
        {/* 404 Number */}
        <h1 className="text-9xl font-bold text-primary/20 mb-4">
          404
        </h1>

        {/* Error Message */}
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/start"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Start a Project
            </Link>
            <Link
              href="/pricing"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}