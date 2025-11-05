"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
}

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = useMemo<NavItem[]>(() => [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Process', href: '/process' },
    { label: 'About', href: '/about' }
  ], []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[60] bg-background px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-200",
          isScrolled
            ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm"
            : "bg-transparent backdrop-blur-sm",
          "h-14 md:h-16",
          className
        )}
      >
        <div className="container-width h-full">
          <div className="flex h-full items-center justify-between">
            {/* Logo/Brand */}
            <Link
              href="/"
              className="flex items-center space-x-2 transition-base hover:text-primary focus-visible:text-primary"
            >
              <span className="text-xl font-semibold">Crowned Gladiator</span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-6"
              aria-label="Main navigation"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium transition-base hover:text-primary focus-visible:text-primary",
                    "after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-primary",
                    "after:transform after:scale-x-0 after:transition-transform after:duration-200",
                    isActiveLink(item.href)
                      ? "text-primary after:scale-x-100"
                      : "hover:after:scale-x-100"
                  )}
                  aria-current={isActiveLink(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <Button
                asChild
                className="transition-base hover:scale-[1.02] focus-visible:scale-[1.02]"
              >
                <Link href="/start">Start Your Project</Link>
              </Button>
            </div>

            {/* Mobile Menu Trigger and CTA */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                asChild
                size="sm"
                className="transition-base hover:scale-[1.02] focus-visible:scale-[1.02]"
              >
                <Link href="/start">Start Project</Link>
              </Button>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Toggle navigation menu"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] sm:w-[350px]"
                  onEscapeKeyDown={handleMobileMenuClose}
                >
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Main navigation menu for mobile devices
                  </SheetDescription>
                  <nav
                    className="flex flex-col mt-8"
                    aria-label="Mobile navigation"
                  >
                    {navItems.map((item, index) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleMobileMenuClose}
                        className={cn(
                          "flex items-center py-4 px-4 text-base font-medium transition-base",
                          "hover:text-primary hover:bg-muted/50 focus-visible:text-primary focus-visible:bg-muted/50",
                          index !== navItems.length - 1 && "border-b",
                          isActiveLink(item.href) && "text-primary bg-muted/30"
                        )}
                        aria-current={isActiveLink(item.href) ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    ))}

                    <div className="mt-8 px-4">
                      <Button
                        asChild
                        className="w-full transition-base hover:scale-[1.02] focus-visible:scale-[1.02]"
                        onClick={handleMobileMenuClose}
                      >
                        <Link href="/start">Start Your Project</Link>
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}