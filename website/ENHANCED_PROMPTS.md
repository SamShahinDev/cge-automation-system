# CGE Website - Complete Enhanced Build Prompts

## Overview
This document contains all enhanced prompts for building the Crowned Gladiator Enterprises website. Each prompt includes complete technical specifications, exact implementation details, and success criteria.

## Current Status
- Phase 1: ✅ Complete (Homepage)
- Phase 2: 🚧 In Progress (Pricing Page - Prompts 1-2 complete, 3-9 ready to build)
- Phase 3: 📝 Ready (Process Page)
- Phase 4: 📝 Ready (About Page)
- Phase 5: 📝 Ready (Contact/Start Page)

---

# Phase 2: Pricing Page (Prompts 3-9)

## Enhanced Prompt 3: Pricing Model Section with Icon Integration

Create the pricing model explanation section at `src/components/pricing/pricing-model.tsx`.

This component explains the three-part pricing structure with visual clarity and professional presentation.

### Component Requirements:

**1. Create the base component structure:**

```typescript
import { Settings, Calendar, Key } from 'lucide-react';

export function PricingModel() {
  return (
    <section className="container-width py-20 lg:py-24">
      {/* Content here */}
    </section>
  );
}
```

**2. Layout Structure:**
- Use container-width utility for consistent spacing
- Center all content with mx-auto max-w-4xl
- Vertical padding: 80px (py-20) on mobile, 96px (py-24) on desktop
- Background: White (default background)

**3. Section Heading:**

```typescript
<div className="text-center mb-12 lg:mb-16">
  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
    How Our Pricing Works
  </h2>
  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
    Simple, transparent pricing with no surprises
  </p>
</div>
```

**4. Three-Column Grid:**

```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
  {pricingModels.map((model) => (
    <div key={model.title} className="text-center space-y-4">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <model.icon className="w-8 h-8 text-primary" />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          {model.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {model.description}
        </p>
      </div>
    </div>
  ))}
</div>
```

**5. Data Structure:**

```typescript
const pricingModels = [
  {
    icon: Settings,
    title: "One-Time Setup Fee",
    description: "Covers discovery, design, and initial development of your custom solution"
  },
  {
    icon: Calendar,
    title: "Monthly Subscription",
    description: "Predictable monthly cost for hosting, support, updates, and improvements"
  },
  {
    icon: Key,
    title: "Full Ownership",
    description: "You own all code and intellectual property. No vendor lock-in, ever"
  }
];
```

**6. Responsive Behavior:**
- Mobile (< 768px): Single column, stack vertically with 32px gaps
- Tablet (768px - 1024px): Three columns with 32px gaps
- Desktop (> 1024px): Three columns with 48px gaps
- Icons maintain consistent 64px diameter circles
- Text remains center-aligned at all breakpoints

**7. Animation on Scroll:**

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

export function PricingModel() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`container-width py-20 lg:py-24 transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Content */}
    </section>
  );
}
```

---END PROMPT---

## Enhanced Prompt 4: Investment Tiers with Featured Card Pattern

Create the investment tiers section at `src/components/pricing/pricing-tiers.tsx`.

This component displays three pricing tiers with a featured middle option, using shadcn Card components for consistency.

### Component Requirements:

**1. Import Required Dependencies:**

```typescript
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
```

**2. Pricing Tiers Data Structure:**

```typescript
const pricingTiers = [
  {
    name: "Simple Systems",
    setup: "From $2,000",
    monthly: "From $500/mo",
    timeline: "3-4 weeks",
    examples: [
      "Basic customer database",
      "Simple inventory tracker",
      "Team task manager",
      "Document management"
    ],
    featured: false
  },
  {
    name: "Standard Business Apps",
    setup: "From $5,000",
    monthly: "From $950/mo",
    timeline: "6-8 weeks",
    examples: [
      "Full CRM system",
      "Workflow automation",
      "Custom dashboards",
      "Advanced reporting"
    ],
    featured: true,
    badge: "Most Popular"
  },
  {
    name: "Complex Platforms",
    setup: "Custom quote",
    monthly: "Custom quote",
    timeline: "8-12 weeks",
    examples: [
      "Multi-location systems",
      "Complex integrations",
      "Industry platforms",
      "Enterprise solutions"
    ],
    featured: false
  }
];
```

**3. Featured Card Styling:**
- 2px primary border instead of default 1px
- Elevated shadow (shadow-lg)
- Scale transform (1.05 mobile, 1.1 desktop)
- Badge positioned absolutely above card
- Primary button instead of outline

**4. Responsive Behavior:**
- Mobile: Single column, full width cards
- Desktop: Three equal columns
- Featured card scales slightly larger
- Maintains equal height using flex layout

---END PROMPT---

## Enhanced Prompt 5: Responsive Comparison Table

Create the pricing comparison section at `src/components/pricing/pricing-comparison.tsx`.

This component compares your offering against Generic SaaS and Traditional Development, with responsive design that switches between table (desktop) and cards (mobile).

### Comparison Data Structure:

```typescript
const comparisonData = {
  categories: [
    { label: "Approach", key: "approach" },
    { label: "Initial Cost", key: "cost" },
    { label: "Monthly Cost", key: "monthly" },
    { label: "Code Ownership", key: "ownership" },
    { label: "Customization", key: "customization" },
    { label: "Ongoing Support", key: "support" },
    { label: "Timeline", key: "timeline" }
  ],
  options: [
    {
      name: "Generic SaaS",
      tagline: "HubSpot, Salesforce, etc.",
      highlighted: false,
      features: {
        approach: "One-size-fits-all platform",
        cost: "$0 - $1,000",
        monthly: "$200 - $500/mo forever",
        ownership: { value: false, text: "You own nothing" },
        customization: { value: false, text: "Limited to their features" },
        support: { value: "partial", text: "Generic support" },
        timeline: "Immediate setup"
      }
    },
    {
      name: "Crowned Software",
      tagline: "That's us!",
      highlighted: true,
      features: {
        approach: "Custom built for you",
        cost: "$2,000 - $10,000",
        monthly: "$500 - $2,500/mo",
        ownership: { value: true, text: "100% yours, always" },
        customization: { value: true, text: "Built for your needs" },
        support: { value: true, text: "Included & proactive" },
        timeline: "4-8 weeks"
      }
    }
  ]
};
```

**Cell Rendering Logic:**
- Use Check icon (green) for true values
- Use X icon (red) for false values
- Display text for partial/custom values

---END PROMPT---

## Enhanced Prompt 6: FAQ Section with Accordion

Create the FAQ section at `src/components/pricing/pricing-faq.tsx` using shadcn's Accordion component.

### FAQ Data Structure:

```typescript
const faqData = [
  {
    question: "What's included in the setup fee?",
    answer: "The setup fee covers everything needed to launch your custom software: comprehensive discovery sessions to understand your business, custom design and architecture planning, initial development and testing of your solution, training for your team, and full deployment. This is a one-time investment that gets you from idea to working software."
  },
  {
    question: "What does the monthly fee cover?",
    answer: "Your monthly subscription includes hosting and infrastructure management, automatic security updates and backups, bug fixes and minor updates, ongoing email support with 24-hour response times, and performance monitoring. Think of it as having a dedicated IT team for your custom software at a fraction of the cost."
  },
  {
    question: "Can I cancel anytime?",
    answer: "We require a 12-month initial commitment to ensure we can properly support your software implementation and success. After that, it's month-to-month with a simple 30-day notice to cancel. And here's the best part: you keep all the code and documentation, so your software continues working even if you decide to manage it yourself."
  },
  {
    question: "Do I really own the code?",
    answer: "Absolutely. You get 100% ownership of all code and intellectual property we create for you. We provide the complete source code, full documentation, and deployment instructions. There's no vendor lock-in whatsoever. You can take your software to another developer or manage it in-house at any time."
  },
  {
    question: "How do you keep costs so low?",
    answer: "We use modern development practices and efficient project management to deliver enterprise-quality software faster. By focusing on small to medium businesses and having minimal corporate overhead, we can offer custom development at prices typically reserved for off-the-shelf software."
  }
];
```

**Accordion Behavior:**
- type="single" - Only one item open at a time
- collapsible - Clicking open item closes it
- Smooth animation (built into shadcn component)
- Chevron icon rotates on open/close

---END PROMPT---

## Enhanced Prompt 7: CTA Section with Strong Visual Impact

Create the final call-to-action section at `src/components/pricing/pricing-cta.tsx`.

### Component Structure:

```typescript
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
        className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6 h-auto group"
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
```

**Layout Specifications:**
- Full width background: bg-primary (professional blue)
- Text color: text-primary-foreground (white)
- Content centered with max-w-3xl
- Button inverted colors (white bg, dark text)

---END PROMPT---

## Enhanced Prompt 8: Interactive Elements & Micro-interactions

Add interactive enhancements to increase engagement and provide a premium user experience.

### Interactive Elements to Implement:

**1. Pricing Tier Hover States:**
```typescript
const [hoveredTier, setHoveredTier] = useState<string | null>(null);

<Card 
  onMouseEnter={() => setHoveredTier(tier.name)}
  onMouseLeave={() => setHoveredTier(null)}
  className={cn(
    "transition-all duration-300 cursor-pointer",
    hoveredTier === tier.name && "shadow-md border-primary/50"
  )}
>
```

**2. FAQ Item Indicators:**
- Add numbered badges that change color when open
- Highlight border when accordion item is expanded

**3. Smooth Scroll Animations:**
- Fade in sections on scroll using IntersectionObserver
- Stagger animations for grid items
- Number count-up animations for prices

---END PROMPT---

## Enhanced Prompt 9: Mobile Optimization & Final Integration

Complete the pricing page with mobile optimizations, testing, and deployment.

### Mobile-Specific Optimizations:

**1. Touch-Optimized Interactions:**
- Minimum tap targets: 44px × 44px
- Active states with scale feedback
- Remove hover states on touch devices

**2. Mobile Sticky CTA:**
```typescript
<div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-40">
  <Button asChild className="w-full h-12">
    <Link href="/start">Get Your Quote</Link>
  </Button>
</div>
```

**3. Swipeable Pricing Tiers:**
- Horizontal scroll with snap points
- Progress dots below cards
- Hide scrollbar but maintain functionality

### Final Page Integration:

```typescript
// src/app/(marketing)/pricing/page.tsx
import dynamic from 'next/dynamic';

// Static imports for above-fold
import { PricingHero } from '@/components/pricing/pricing-hero';
import { PricingModel } from '@/components/pricing/pricing-model';

// Dynamic imports for below-fold
const PricingTiers = dynamic(() => import('@/components/pricing/pricing-tiers'));
const PricingComparison = dynamic(() => import('@/components/pricing/pricing-comparison'));
const PricingFAQ = dynamic(() => import('@/components/pricing/pricing-faq'));
const PricingCTA = dynamic(() => import('@/components/pricing/pricing-cta'));

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        <PricingHero />
        <PricingModel />
        <PricingTiers />
        <PricingComparison />
        <PricingFAQ />
        <PricingCTA />
      </main>
      <Footer />
    </>
  );
}
```

### Comprehensive Testing Checklist:

**Device Testing:**
- [ ] iPhone 12/13/14 (390px)
- [ ] Samsung Galaxy S21 (360px)
- [ ] iPad (768px)
- [ ] Desktop 1280px, 1440px, 1920px

**Functionality:**
- [ ] All buttons link correctly
- [ ] FAQ accordion works smoothly
- [ ] Hover states on desktop
- [ ] Touch feedback on mobile
- [ ] Smooth scrolling

**Performance:**
- [ ] Lighthouse score > 95
- [ ] First Contentful Paint < 1.5s
- [ ] No console errors
- [ ] Page size < 500KB

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast WCAG AA
- [ ] Focus states visible

### Success Criteria:

The pricing page is complete when:
- ✅ All sections render correctly on mobile and desktop
- ✅ Lighthouse score >95
- ✅ All interactive elements work smoothly
- ✅ Page loads in <2 seconds
- ✅ No console errors
- ✅ Cross-browser compatibility verified
- ✅ Accessibility audit passes

---END PROMPT---

# Phase 3: Process Page

## Enhanced Prompt 1: Process Page Setup & Route

Create the process page structure at `src/app/(marketing)/process/page.tsx`.

### File Structure:

```typescript
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Our Process | 4 Phases to Your Custom Software | Crowned Gladiator',
  description: 'Our proven 4-phase process for building custom software. From discovery to launch in 4-12 weeks. See exactly how we work.',
  openGraph: {
    title: 'Complex Problems. Simple Process. | Crowned Gladiator',
    description: 'From idea to launch in 4-12 weeks. See our proven development process.',
  },
};

export default function ProcessPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Components will be added here */}
      </main>
      <Footer />
    </>
  );
}
```

Create component folder: `src/components/process/`

---END PROMPT---

## Enhanced Prompt 2: Process Hero Section

Create `src/components/process/process-hero.tsx` with dark background and animated timeline.

### Component Structure:

```typescript
'use client';

import { useEffect, useState } from 'react';

export function ProcessHero() {
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const phases = ['Discover', 'Build', 'Launch', 'Grow'];

  return (
    <section className="relative w-full bg-foreground text-background py-32 lg:py-40 overflow-hidden">
      <div className="container-width">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Complex Problems. Simple Process.
          </h1>
          
          <p className="text-xl lg:text-2xl opacity-80">
            From idea to launch in 4-12 weeks
          </p>

          {/* Animated Timeline */}
          <div className="flex items-center justify-center gap-4 mt-12">
            {phases.map((phase, index) => (
              <div key={phase} className="flex items-center">
                <div className="relative">
                  <div
                    className={`
                      w-3 h-3 rounded-full transition-all duration-500
                      ${activePhase === index 
                        ? 'bg-primary scale-150' 
                        : 'bg-background/40'
                      }
                    `}
                  />
                  {activePhase === index && (
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping" />
                  )}
                </div>
                {index < phases.length - 1 && (
                  <div className="w-16 h-0.5 bg-background/20 ml-4" />
                )}
                <span className={`
                  ml-4 text-sm transition-opacity duration-500
                  ${activePhase === index ? 'opacity-100' : 'opacity-40'}
                `}>
                  {phase}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

---END PROMPT---

## Enhanced Prompt 3: Process Overview Section

Create `src/components/process/process-overview.tsx` with four overview cards.

### Component Structure:

```typescript
import { Search, Code, Rocket, TrendingUp } from 'lucide-react';

const processSteps = [
  {
    phase: 1,
    title: "Discovery",
    duration: "2 weeks",
    description: "We learn everything about your business",
    icon: Search,
  },
  {
    phase: 2,
    title: "Development",
    duration: "4-8 weeks",
    description: "We build your custom solution",
    icon: Code,
  },
  {
    phase: 3,
    title: "Launch",
    duration: "1 week",
    description: "We deploy and train your team",
    icon: Rocket,
  },
  {
    phase: 4,
    title: "Evolution",
    duration: "Ongoing",
    description: "We help your software grow",
    icon: TrendingUp,
  },
];

export function ProcessOverview() {
  return (
    <section className="container-width py-20 lg:py-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {processSteps.map((step) => (
          <div key={step.phase} className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">
                Phase {step.phase} • {step.duration}
              </p>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---END PROMPT---

## Enhanced Prompt 4: Phase 1 - Discovery Section

Create `src/components/process/phase-discovery.tsx` with full viewport height and split layout.

### Complete Implementation:

```typescript
'use client';

import { CheckCircle } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';

const activities = [
  "Stakeholder interviews",
  "Workflow documentation",
  "Pain point analysis",
  "Technical architecture planning",
  "Success metrics definition",
];

const deliverables = [
  "Project roadmap",
  "Technical specification",
  "Fixed quote with timeline",
];

export function PhaseDiscovery() {
  const { ref, isInView } = useInView({ threshold: 0.3 });

  return (
    <section className="min-h-screen flex items-center py-20" ref={ref}>
      <div className="container-width">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className={`
            space-y-8 transition-all duration-1000
            ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}
          `}>
            <div className="space-y-4">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">
                Phase 1
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold">Discovery</h2>
              <p className="text-xl text-muted-foreground">2 weeks</p>
              <p className="text-lg">We become experts in your business</p>
            </div>

            {/* Activities */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">What we do:</h3>
              <ul className="space-y-3">
                {activities.map((activity, index) => (
                  <li 
                    key={activity}
                    className={`
                      flex items-center gap-3 transition-all duration-500
                      ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}
                    `}
                    style={{ transitionDelay: `${index * 100 + 200}ms` }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables */}
            <div className="bg-muted rounded-lg p-6 space-y-4">
              <h3 className="font-semibold">What you get:</h3>
              <ul className="space-y-2">
                {deliverables.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Visual */}
          <div className={`
            transition-all duration-1000 delay-300
            ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}>
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-background/50 backdrop-blur rounded-lg p-4 h-24"
                    style={{
                      animationDelay: `${i * 200}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---END PROMPT---

## Enhanced Prompt 5: Phase 2 - Development Section

Create `src/components/process/phase-development.tsx` with reversed layout and muted background.

[Continue with similar detailed implementations for remaining phases...]

---END PROMPT---

## Enhanced Prompt 6: Phase 3 - Launch Section

Create `src/components/process/phase-launch.tsx` with launch checklist and support commitment.

[Implementation details...]

---END PROMPT---

## Enhanced Prompt 7: Phase 4 - Evolution Section

Create `src/components/process/phase-evolution.tsx` with gradient background and centered content.

[Implementation details...]

---END PROMPT---

## Enhanced Prompt 8: Interactive Timeline Component

Create `src/components/process/process-timeline.tsx` with sticky positioning and scroll progress.

[Implementation details...]

---END PROMPT---

## Enhanced Prompt 9: Process Page Integration & Animations

Complete the process page with scroll animations, navigation, and final touches.

[Implementation details...]

---END PROMPT---

# Phase 4: About Page

[Continue with Phase 4 prompts...]

# Phase 5: Contact/Start Page

[Continue with Phase 5 prompts...]

---

## Execution Instructions

Each prompt is marked with `---END PROMPT---` for easy parsing by automation tools.

To execute:
1. Start with current phase (Phase 2, Prompt 3)
2. Execute prompts sequentially
3. Git commit after each successful implementation
4. Test each component before moving to next

Success Metrics:
- Each component renders without errors
- Responsive design works on all breakpoints
- Animations are smooth (60fps)
- Lighthouse score remains >95
- No TypeScript errors