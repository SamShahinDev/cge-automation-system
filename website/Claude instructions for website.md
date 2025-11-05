# Complete Development Instructions for Custom Software Website

## Project Overview
Building a minimalist, professional website for a custom software development company that offers enterprise-quality solutions at SMB-friendly subscription prices. The site must communicate trust, transparency, and technical capability while remaining accessible to non-technical business owners.

## Core Design System Parameters

### 1. Visual Design Specifications
```css
/* Color Palette - MUST use these exact HSL values */
--primary: 214 54% 41%;          /* Professional blue #3060A0 */
--primary-foreground: 0 0% 100%; /* White text on primary */
--background: 0 0% 100%;         /* Pure white */
--foreground: 0 0% 10%;          /* Near black for text */
--muted: 0 0% 97%;              /* Subtle gray backgrounds */
--muted-foreground: 0 0% 45%;   /* Gray text */
--border: 0 0% 92%;             /* Light borders */
--destructive: 0 84% 60%;       /* Error states */

/* Dark mode adjustments */
--primary-dark: 214 58% 56%;     /* Lifted for contrast */
--background-dark: 0 0% 7%;      /* Near black */
--foreground-dark: 0 0% 98%;     /* Near white */
```

### 2. Typography Rules

- **Font Family:** Inter for all text (import from next/font/google)
- **Base Size:** 16px (1rem)
- **Scale:** 1.25 ratio (Minor Third)
- **Headings:**
  - H1: 3rem (48px) desktop, 2.25rem (36px) mobile
  - H2: 2.25rem (36px) desktop, 1.875rem (30px) mobile
  - H3: 1.875rem (30px) desktop, 1.5rem (24px) mobile
  - H4: 1.5rem (24px) desktop, 1.25rem (20px) mobile
- **Line Heights:** 1.2 for headings, 1.6 for body text
- **Font Weights:** 400 regular, 500 medium, 600 semibold, 700 bold

### 3. Spacing System
```css
/* 8px base unit - STRICTLY follow this system */
--space-xs: 0.5rem;   /* 8px */
--space-sm: 1rem;     /* 16px */
--space-md: 2rem;     /* 32px */
--space-lg: 3rem;     /* 48px */
--space-xl: 5rem;     /* 80px */
--space-2xl: 7.5rem;  /* 120px */

/* Container constraints */
--container-max: 1280px;
--container-padding: 1rem sm:1.5rem lg:2rem;
```

### 4. Component Standards

- **Borders:** Always 1px solid using --border color
- **Border Radius:** 0.75rem (12px) for cards, 0.5rem for inputs
- **Shadows:** Use sparingly - only sm and md from Tailwind
- **Transitions:** 200ms ease for all hover states
- **Buttons:**
  - Height: 40px (default), 48px (large)
  - Padding: 16px horizontal minimum
  - Always use shadcn button component

## Technical Implementation Rules

### 1. Framework Requirements

- Next.js 14+ with App Router
- TypeScript for all components (no any types)
- Tailwind CSS for styling (no inline styles)
- shadcn/ui for all UI components
- React Hook Form + Zod for forms
- Framer Motion for animations (sparingly)

### 2. Component Architecture
```typescript
// EVERY component must follow this structure
interface ComponentProps {
  className?: string; // Always allow className override
  // Other props with proper types
}

export function ComponentName({ className, ...props }: ComponentProps) {
  return (
    <div className={cn("base-classes", className)} {...props}>
      {/* Content */}
    </div>
  );
}
```

### 3. File Organization
```
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx          # Homepage
│   │   ├── pricing/page.tsx
│   │   ├── process/page.tsx
│   │   ├── about/page.tsx
│   │   └── start/page.tsx
├── components/
│   ├── ui/                   # shadcn components only
│   ├── layout/              # Header, Footer
│   └── [page-name]/         # Page-specific components
├── lib/
│   └── utils.ts             # cn helper, etc.
└── styles/
    └── globals.css          # Design tokens only
```

### 4. Performance Standards

- **Lighthouse Score:** Must maintain 95+ on all metrics
- **First Contentful Paint:** < 1 second
- **Cumulative Layout Shift:** < 0.1
- **Images:** Always use next/image with proper sizing
- **Fonts:** Use next/font with display: swap

### 5. Responsive Design Rules
```typescript
// Breakpoint usage - mobile-first ALWAYS
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px

// Good: Mobile-first
className="text-sm md:text-base lg:text-lg"

// Bad: Desktop-first
className="text-lg md:text-base sm:text-sm"
```

## Content & Messaging Guidelines

### 1. Tone of Voice

- Professional but not corporate
- Clear technical concepts without jargon
- Direct value propositions
- Honest about capabilities and pricing
- Confident without being boastful

### 2. Headline Formulas

- **Main headlines:** [Benefit] + [Differentiator]
- **Subheadings:** Expand on the promise
- **CTAs:** Action-oriented, specific outcomes

### 3. Prohibited Elements

- ❌ Stock photos of people
- ❌ Generic tech imagery (gears, circuits)
- ❌ Testimonials or logos (until available)
- ❌ Technical jargon in main content
- ❌ "AI" or "Machine Learning" mentions
- ❌ Promises of specific timelines in content

## Animation & Interaction Rules

### 1. Permitted Animations
```css
/* Fade in on scroll */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Use sparingly with Intersection Observer */
.animate-in {
  animation: fadeInUp 0.6s ease forwards;
}
```

### 2. Hover States

- **Scale:** Maximum 1.02 scale on buttons
- **Color:** Darken by 10% using Tailwind modifiers
- **Transition:** Always 200ms ease
- **Cursor:** pointer for all interactive elements

### 3. Prohibited Animations

- ❌ Bouncing or spring animations
- ❌ Auto-playing videos or sliders
- ❌ Parallax scrolling effects
- ❌ Loading spinners (use skeletons)

## Quality Assurance Checklist

### Before Moving to Next Phase

- [ ] All components use shadcn/ui or follow its patterns
- [ ] TypeScript has no errors or warnings
- [ ] Mobile responsive tested at 375px, 768px, 1024px
- [ ] All interactive elements have hover/focus states
- [ ] Page loads in under 2 seconds
- [ ] Accessibility scan passes (aXe DevTools)
- [ ] No console errors or warnings
- [ ] Form validation provides helpful errors
- [ ] All text is selectable and readable
- [ ] Dark mode functions correctly (if implemented)

## Code Review Standards
```typescript
// GOOD: Semantic, accessible, maintainable
<Button variant="default" size="lg" asChild>
  <Link href="/start">Start Your Project</Link>
</Button>

// BAD: Inline styles, no semantics
<div style={{backgroundColor: 'blue'}} onClick={() => navigate('/start')}>
  Start Your Project
</div>
```

## SEO & Meta Requirements

### Each Page Must Include
```typescript
export const metadata: Metadata = {
  title: 'Page Title | Custom Software Development',
  description: 'Clear, benefit-driven description under 160 characters',
  openGraph: {
    title: 'Same as title',
    description: 'Same as description',
    type: 'website',
  },
};
```

## Form Development Rules

### 1. All Forms Must

- Use React Hook Form with Zod validation
- Show inline errors immediately
- Save progress to sessionStorage
- Have clear, helpful error messages
- Include loading states
- Prevent double submissions

### 2. Validation Messages
```typescript
// GOOD: Helpful and specific
email: z.string().email('Please enter a valid email address')

// BAD: Generic
email: z.string().email('Invalid input')
```

## Testing Requirements

### Before Deployment

- Test on real devices (iPhone, Android)
- Test with slow 3G throttling
- Test with keyboard navigation only
- Test with screen reader (NVDA/JAWS)
- Test form submissions and error states
- Test all interactive elements
- Verify analytics tracking

## Deployment Standards

### Production Requirements

- Enable static optimization where possible
- Implement proper error boundaries
- Set up monitoring (Vercel Analytics)
- Configure proper caching headers
- Enable security headers
- Set up proper redirects

## Communication With Claude Code

When prompting Claude Code, always:

- Reference these design parameters
- Specify exact component locations
- Include TypeScript interfaces
- Request shadcn/ui component usage
- Ask for mobile-first responsive design
- Require accessibility considerations
- Specify performance requirements

## Final Implementation Notes

- **Consistency is Critical:** Every page should feel like part of the same system
- **Less is More:** When in doubt, remove elements rather than add
- **Performance First:** A fast site builds trust
- **Mobile Experience:** Must be as good as desktop, not an afterthought
- **Accessibility:** Not optional - build it in from the start

These instructions ensure a cohesive, professional website that effectively communicates the value proposition while maintaining the high standards expected from a custom software development company.