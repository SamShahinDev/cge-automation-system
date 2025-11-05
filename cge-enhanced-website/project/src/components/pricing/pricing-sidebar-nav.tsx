"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
}

const sections: Section[] = [
  { id: "hero", title: "Overview" },
  { id: "model", title: "Pricing Model" },
  { id: "tiers", title: "Investment Tiers" },
  { id: "comparison", title: "Compare Options" },
  { id: "faq", title: "FAQ" },
  { id: "cta", title: "Get Started" },
];

export function PricingSidebarNav() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);

      // Determine active section
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Header offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-40">
      <nav className="relative">
        {/* Progress Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted">
          <div
            className="absolute top-0 left-0 w-full bg-primary transition-all duration-300"
            style={{ height: `${scrollProgress}%` }}
          />
        </div>

        {/* Navigation Items */}
        <ul className="space-y-4 pl-6">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "text-sm transition-all duration-200 hover:text-primary text-left relative",
                  activeSection === section.id
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {/* Active Indicator Dot */}
                <span
                  className={cn(
                    "absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-200",
                    activeSection === section.id
                      ? "bg-primary border-primary scale-110"
                      : "bg-background border-muted"
                  )}
                />
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
