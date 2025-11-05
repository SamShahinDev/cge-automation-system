# CGE Enhanced Website - Build Prompts

**Project:** CGE Enhanced Website - Custom Software Development Company
**Created:** 2025-10-12
**Total Prompts:** 45 (5 Phases)
**Status:** Ready to build

---

# Phase 1: Homepage Build - Foundation & Core Pages

## Enhanced Prompt 1: Project Setup & Base Configuration

Create a new Next.js 14 project with TypeScript, Tailwind CSS, and shadcn/ui for a custom software development company website.

IMPORTANT: Initialize the Next.js project in the CURRENT DIRECTORY (not in a subdirectory). Use `npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir` to create the project in place.

Features needed:
- App Router
- TypeScript
- Tailwind CSS
- ESLint
- src/ directory
- Initialize in current directory (use "." as project name)

After Next.js setup completes, install and configure shadcn/ui:
- Run: `npx shadcn@latest init` with these options:
  - Style: Default
  - Base color: Neutral
  - CSS variables: Yes
- Then add these shadcn components: `npx shadcn@latest add button card navigation-menu separator`

Create this folder structure:
- src/app/(marketing)/page.tsx for homepage
- src/components/ui/ for shadcn components
- src/components/layout/ for header/footer
- src/components/home/ for homepage sections

Make sure all files are created in the current project directory, not in a subdirectory.

---END PROMPT---

## Enhanced Prompt 2: Design System & Global Styles

Set up the design system in src/app/globals.css with these specifications:

Color Palette (HSL):
- Primary: 214 54% 41% (professional blue)
- Primary-foreground: 0 0% 100%
- Background: 0 0% 100%
- Foreground: 0 0% 10%
- Muted: 0 0% 97%
- Muted-foreground: 0 0% 45%
- Border: 0 0% 92%
- Ring: 214 54% 41%

Typography:
- Import Inter font from next/font/google
- Base font size: 16px
- Heading scale: 3rem, 2.25rem, 1.875rem, 1.5rem, 1.25rem, 1rem
- Line height: 1.6 for body, 1.2 for headings

Global styles:
- Smooth scroll behavior
- Selection color using primary
- 8px spacing base unit
- Container max-width: 1280px
- Section padding: 120px vertical on desktop, 60px on mobile

Add CSS custom properties for consistent spacing:
- --space-xs: 0.5rem
- --space-sm: 1rem
- --space-md: 2rem
- --space-lg: 3rem
- --space-xl: 5rem
- --space-2xl: 7.5rem

---END PROMPT---

## Enhanced Prompt 3: Header Component with Navigation

Create a header component at src/components/layout/header.tsx with:

Structure:
- Fixed positioning with backdrop blur
- Transparent initially, solid white background on scroll (use React hook)
- Height: 64px on desktop, 56px on mobile
- Z-index: 50

Content:
- Logo placeholder (left): "CustomSoft" text in 20px font-weight-600
- Desktop nav (center): Home, Pricing, Process, About, hidden on mobile
- CTA button (right): "Start Your Project" using shadcn button component
- Mobile menu: Hamburger icon that opens sheet component with nav links

Styling:
- Smooth transitions for background change (200ms)
- Nav links: 14px, medium weight, 24px gap between
- Hover states: Primary color for links
- Active states: Primary color with bottom border

Make it responsive with Tailwind breakpoints

---END PROMPT---

## Enhanced Prompt 4: Hero Section

Create a hero section component at src/components/home/hero.tsx:

Layout:
- Full viewport height (100vh)
- Centered content with max-width-4xl
- Padding: 16px mobile, 24px tablet, 32px desktop

Content structure:

1. Headline: "Custom Software. Monthly Subscription. No Complexity."
   - Font size: 48px mobile, 72px desktop
   - Font weight: 700
   - Letter spacing: -0.02em

2. Subheading: "We build software that works exactly how your business works."
   - Font size: 20px mobile, 24px desktop
   - Text color: muted-foreground
   - Max width: 600px
   - Margin top: 24px

3. CTA Button: "Start Your Project"
   - Size: large
   - Full width on mobile, auto on desktop
   - Margin top: 40px

4. Value props strip below (flex row, wraps on mobile):
   - "Setup from $2,000"
   - "Monthly from $500"
   - "You Own Everything"
   - Font size: 14px, medium weight
   - Separated by dots on desktop, stacked on mobile

Background:
- Subtle radial gradient from primary/5 to transparent
- Optional: Add subtle floating gradient orbs using CSS (low opacity)

Add fade-in animation on mount using CSS animations

---END PROMPT---

## Enhanced Prompt 5: What We Build Section

Create a "What We Build" section at src/components/home/what-we-build.tsx:

Layout:
- Contained width with responsive padding
- 120px padding top/bottom desktop, 60px mobile

Heading:
- "What We Build"
- Center aligned
- 48px desktop, 36px mobile
- Margin bottom: 60px

Grid of capabilities (2x2 desktop, 1 column mobile):
1. Customer Management Systems
2. Internal Tools & Dashboards
3. Workflow Automation
4. Industry-Specific Solutions

Each grid item:
- Card component with subtle border
- Padding: 32px
- Heading: 20px, font-weight 600
- Description: 16px, text-muted-foreground, appears on hover
- Hover effect: Slight scale (1.02) and shadow transition
- Cursor pointer

Descriptions:
- "Track customers, sales, and relationships exactly how you need"
- "Custom dashboards and tools for your team's unique workflow"
- "Automate repetitive tasks with software built for your process"
- "Specialized solutions for healthcare, manufacturing, and more"

---END PROMPT---

## Enhanced Prompt 6: How It Works Section

Create a "How It Works" section at src/components/home/how-it-works.tsx:

Layout:
- Full width background: muted color
- Content contained and centered
- 120px padding vertical

Heading:
- "How It Works"
- Center aligned
- 48px desktop, 36px mobile

Timeline (horizontal desktop, vertical mobile):
3 steps with connecting lines

Step 1: "We Learn Your Business"
- Description: "Deep dive into your workflows and needs"

Step 2: "We Build Your Solution"
- Description: "Custom software crafted for your exact requirements"

Step 3: "You Pay Monthly, Own Forever"
- Description: "Affordable payments, full ownership"

Step styling:
- Number in circle: 40px diameter, primary background
- Heading: 20px, font-weight 600
- Description: 16px, muted-foreground
- Connecting line: 2px, border color
- Mobile: Stack vertically with line on left

Add stagger animation on scroll into view

---END PROMPT---

## Enhanced Prompt 7: Footer Component

Create a minimal footer at src/components/layout/footer.tsx:

Structure:
- Background: foreground color, white text
- Padding: 48px vertical, responsive horizontal
- Two sections: Main and bottom bar

Main section (centered, max-width-6xl):
- Company name: "CustomSoft" in 20px
- Tagline below: "Custom software at subscription prices"
- Contact email: contact@customsoft.com

Bottom bar:
- Border top: 1px solid white/10
- Padding: 24px vertical
- Flex row, space between, wrap on mobile
- Left: © 2024 CustomSoft. All rights reserved.
- Right: Privacy Policy | Terms of Service (with separators)

Links:
- Hover: Opacity 0.8
- Transition: 150ms

---END PROMPT---

## Enhanced Prompt 8: Responsive Adjustments & Animations

Add these responsive refinements and animations:

Responsive breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Typography scaling:
- Create fluid typography using clamp()
- Example: Hero headline clamp(2.5rem, 5vw, 4.5rem)

Spacing adjustments:
- Section padding: 60px mobile, 80px tablet, 120px desktop
- Container padding: 16px mobile, 24px tablet, 32px desktop

Animations to add:

1. Fade up on scroll for all sections
   - Use Intersection Observer
   - Transform: translateY(20px) to 0
   - Opacity: 0 to 1
   - Duration: 600ms
   - Stagger child elements by 100ms

2. Hero content sequence
   - Headline: Immediate
   - Subheading: 200ms delay
   - Button: 400ms delay
   - Value props: 600ms delay

3. Smooth hover states
   - All interactive elements: 200ms transition
   - Scale buttons to 1.02 on hover
   - Darken primary color by 10% on hover

Performance:
- Add loading="lazy" to any images
- Ensure all animations use transform/opacity only
- Add will-change to animated elements

---END PROMPT---

## Enhanced Prompt 9: Final Integration & Testing

Complete the homepage integration:

1. Update src/app/(marketing)/page.tsx to import and compose all sections:
   - Header (sticky)
   - Hero
   - What We Build
   - How It Works
   - Footer

2. Add metadata:
   - Title: "Custom Software Development | Affordable Monthly Plans"
   - Description: "Get custom software built for your business at subscription prices. No huge upfront costs. You own everything. Start from $2,000 setup + $500/month."
   - OpenGraph tags
   - Favicon placeholder

3. Performance optimizations:
   - Ensure all components use React Server Components where possible
   - Add dynamic imports for below-fold components
   - Implement font-display: swap for Inter

4. Accessibility:
   - Ensure all interactive elements have focus states
   - Add aria-labels where needed
   - Test keyboard navigation
   - Ensure color contrast meets WCAG AA

5. Create a simple 404 page with link back to home

Test on:
- Chrome, Safari, Firefox
- Mobile devices (iPhone, Android)
- Tablet sizes
- Desktop (1920px, 1440px, 1280px)

The homepage should load in under 2 seconds and score 95+ on Lighthouse.

---END PROMPT---

# Phase 2: Pricing Page - Revenue Communication

## Enhanced Prompt 10: Pricing Page Setup & Route

Create the pricing page structure:

1. Create src/app/(marketing)/pricing/page.tsx with:
   - Page title: "Transparent Pricing. No Surprises."
   - Meta description: "Simple, transparent pricing for custom software development. Low setup fees, affordable monthly payments. You own all the code."

2. Create component folder: src/components/pricing/

3. Import the existing header and footer from phase 1

Page structure outline:
- Header (from phase 1)
- Hero section (smaller than homepage)
- Pricing model explanation
- Investment ranges (3 tiers)
- Comparison section
- FAQ section
- CTA section
- Footer (from phase 1)

---END PROMPT---

## Enhanced Prompt 11: Pricing Hero Section

Create src/components/pricing/pricing-hero.tsx:

Layout:
- Height: 400px (not full viewport)
- Centered content
- Background: Subtle gradient using primary/5

Content:

1. Headline: "Transparent Pricing. No Surprises."
   - Font size: 48px desktop, 36px mobile
   - Font weight: 700
   - Margin bottom: 24px

2. Subheading: "Custom software shouldn't cost more than your annual revenue"
   - Font size: 20px desktop, 18px mobile
   - Color: muted-foreground
   - Max width: 600px, centered

3. Trust badges below (flex row, centered):
   - "No Hidden Fees"
   - "Month-to-Month After Initial Term"
   - "You Own The Code"
   - Style: Small pills with checkmark icons
   - Background: primary/10, primary text

---END PROMPT---

## Enhanced Prompt 12: Pricing Model Section

Create src/components/pricing/pricing-model.tsx:

Layout:
- Container with max-width-4xl
- 80px padding vertical
- White background

Heading:
- "How Our Pricing Works"
- Font size: 36px desktop, 28px mobile
- Center aligned
- Margin bottom: 48px

Three columns (stack on mobile):

1. "One-Time Setup Fee"
   - Icon: Wrench or Settings
   - Description: "Covers discovery, design, and initial development"

2. "Monthly Subscription"
   - Icon: Calendar or Recurring
   - Description: "Predictable monthly cost for hosting, support, and updates"

3. "Full Ownership"
   - Icon: Key or Lock
   - Description: "You own all code and intellectual property"

Column styling:
- Text center aligned
- Icon: 48px, primary color
- Heading: 20px, font-weight 600
- Description: 16px, muted-foreground
- 32px gap between columns

---END PROMPT---

## Enhanced Prompt 13: Investment Tiers Section

Create src/components/pricing/pricing-tiers.tsx:

Layout:
- Full width background: muted
- Container max-width-6xl
- 100px padding vertical

Heading:
- "Investment Ranges"
- Subheading: "Every project is unique. These ranges help you budget."
- Center aligned

Three pricing cards (use shadcn Card):

1. "Simple Systems"
   - Setup: From $2,000
   - Monthly: From $500/mo
   - Examples:
     * Basic customer database
     * Simple inventory tracker
     * Team task manager
   - Timeline: 3-4 weeks

2. "Standard Business Apps" (featured - add border)
   - Setup: From $5,000
   - Monthly: From $950/mo
   - Examples:
     * Full CRM system
     * Workflow automation
     * Custom dashboards
   - Timeline: 6-8 weeks

3. "Complex Platforms"
   - Setup: Custom quote
   - Monthly: Custom quote
   - Examples:
     * Multi-location systems
     * Complex integrations
     * Industry platforms
   - Timeline: 8-12 weeks

Card styling:
- Equal height using grid
- Featured card: Primary border, slight shadow
- Button at bottom: "Get Started" (primary for featured)

---END PROMPT---

## Enhanced Prompt 14: Comparison Section

Create src/components/pricing/pricing-comparison.tsx:

Layout:
- Container max-width-4xl
- 80px padding vertical

Heading:
- "Compare Your Options"
- Center aligned
- Margin bottom: 60px

Comparison table (responsive):

Headers:
- Approach | Cost | Ownership | Flexibility | Support

Rows:

1. Generic SaaS (HubSpot, Salesforce)
   - $200-500/mo forever
   - You own nothing
   - Limited customization
   - Generic support

2. Traditional Development
   - $75,000+ upfront
   - You own it (usually)
   - Very flexible
   - Expensive to maintain

3. Crowned Software (highlighted)
   - Low setup + monthly
   - You own everything
   - Built for you
   - Included support

Mobile: Convert to cards instead of table

Styling:
- Our row: Subtle primary background
- Checkmarks/X marks for visual clarity
- Clean borders and spacing

---END PROMPT---

## Enhanced Prompt 15: FAQ Section

Create src/components/pricing/pricing-faq.tsx:

Layout:
- Container max-width-3xl
- 80px padding vertical

Heading:
- "Common Questions"
- Center aligned

Use shadcn Accordion component for FAQs:

1. "What's included in the setup fee?"
   - Discovery sessions to understand your business
   - Custom design and architecture
   - Initial development and testing
   - Training and deployment

2. "What does the monthly fee cover?"
   - Hosting and infrastructure
   - Security updates and backups
   - Bug fixes and minor updates
   - Email support

3. "Can I cancel anytime?"
   - 12-month initial commitment
   - Month-to-month after that
   - 30-day notice to cancel
   - You keep all code

4. "Do I really own the code?"
   - Yes, 100% ownership transfers to you
   - We provide all source code
   - Full documentation included
   - No vendor lock-in

5. "How do you keep costs so low?"
   - Modern development practices
   - Efficient project management
   - No corporate overhead
   - Focused scope definition

Style:
- Clean typography
- Smooth expand/collapse animations
- Plus/minus icons

---END PROMPT---

## Enhanced Prompt 16: Pricing CTA Section

Create src/components/pricing/pricing-cta.tsx:

Layout:
- Full width background: primary color
- White text
- 80px padding vertical
- Content centered

Content:

1. Headline: "Ready to Build Something Great?"
   - Font size: 36px desktop, 28px mobile
   - White color
   - Margin bottom: 16px

2. Subheading: "Get a custom quote for your project in 48 hours"
   - Font size: 20px
   - Opacity: 0.9
   - Margin bottom: 32px

3. CTA Button: "Start Your Project"
   - White background, primary text
   - Large size
   - Hover: Slight scale effect

4. Trust text below button:
   - "No spam, no pressure. Just honest pricing."
   - Font size: 14px
   - Opacity: 0.8

---END PROMPT---

## Enhanced Prompt 17: Pricing Interactive Elements

Add these interactive enhancements:

1. Pricing calculator slider (optional enhancement):
   - Add to hero section
   - Slider for "Number of users"
   - Shows estimated monthly cost
   - Updates tier recommendation

2. Tier selection interaction:
   - Clicking a tier highlights it
   - Updates URL params for sharing
   - Smooth scroll to CTA

3. FAQ search/filter:
   - Add search input above FAQs
   - Filter questions in real-time
   - Highlight matching text

4. Comparison table enhancements:
   - Hover to highlight row
   - Click to expand details
   - Tooltip explanations

5. Smooth scroll navigation:
   - Sticky sidebar on desktop with section links
   - Progress indicator
   - Smooth scroll to sections

Add animations:
- Fade in sections on scroll
- Number count-up for prices
- Subtle hover states

---END PROMPT---

## Enhanced Prompt 18: Pricing Mobile Optimization

Optimize the pricing page for mobile:

Typography adjustments:
- Reduce font sizes appropriately
- Adjust line heights for readability
- Ensure touch targets are 44px minimum

Layout changes:
- Stack all columns vertically
- Convert comparison table to cards
- Make tier cards swipeable
- Collapse FAQ to show 3 initially

Performance:
- Lazy load below-fold sections
- Optimize animation performance
- Reduce JavaScript bundle

Navigation:
- Add sticky "Get Quote" button on mobile
- Ensure smooth scrolling
- Add back-to-top button

Testing checklist:
- Test on real devices (iPhone 12+, Android)
- Verify all interactive elements work
- Check landscape orientation
- Test with slow 3G connection

Accessibility:
- Screen reader compatible

A/B test elements:
- CTA button text variations
- Pricing display format
- FAQ open/closed by default

The page should clearly communicate value and make it easy for prospects to understand pricing without feeling overwhelmed.

---END PROMPT---

# Phase 3: Process Page - Building Trust

## Enhanced Prompt 19: Process Page Setup & Route

Create the process page structure:

1. Create src/app/(marketing)/process/page.tsx with:
   - Page title: "Complex Problems. Simple Process."
   - Meta description: "Our proven 4-phase process for building custom software. From discovery to launch in 4-12 weeks."

2. Create component folder: src/components/process/

Page structure:
- Header (from phase 1)
- Hero section (compact)
- Process overview
- Four detailed phase sections
- Timeline visual
- Next steps CTA
- Footer (from phase 1)

---END PROMPT---

## Enhanced Prompt 20: Process Hero Section

Create src/components/process/process-hero.tsx:

Layout:
- Height: 500px
- Dark background (foreground color)
- White text
- Centered content

Content:

1. Headline: "Complex Problems. Simple Process."
   - Font size: 56px desktop, 40px mobile
   - Font weight: 700
   - Letter spacing: -0.02em

2. Subheading: "From idea to launch in 4-12 weeks"
   - Font size: 24px desktop, 20px mobile
   - Opacity: 0.8
   - Margin top: 24px

Visual element:
- Simple animated timeline below text
- 4 dots connected by a line
- Dots animate in sequence on load
- Labels: Discover → Build → Launch → Grow

---END PROMPT---

## Enhanced Prompt 21: Process Overview Section

Create src/components/process/process-overview.tsx:

Layout:
- Container max-width-6xl
- 80px padding vertical
- 4 columns on desktop, 2x2 on tablet, stack on mobile

Four overview cards:

1. Phase 1: Discovery (2 weeks)
   - Icon: Magnifying glass
   - "We learn everything about your business"

2. Phase 2: Development (4-8 weeks)
   - Icon: Code/Brackets
   - "We build your custom solution"

3. Phase 3: Launch (1 week)
   - Icon: Rocket
   - "We deploy and train your team"

4. Phase 4: Evolution (Ongoing)
   - Icon: Trending up
   - "We help your software grow"

Card styling:
- No borders, just spacing
- Icon: 48px, primary color
- Phase label: 14px, uppercase, tracked
- Title: 20px, bold
- Description: 16px, muted
- Timeline: 14px, primary color

---END PROMPT---

## Enhanced Prompt 22: Phase 1 - Discovery Section

Create src/components/process/phase-discovery.tsx:

Layout:
- Full viewport height
- Split layout: 50/50 on desktop, stack on mobile
- Alternating background (white)

Left side - Content:
- Phase indicator: "Phase 1" (small, primary color)
- Heading: "Discovery"
- Timeline: "2 weeks"
- Description: "We become experts in your business"

Activities list:
- ✓ Stakeholder interviews
- ✓ Workflow documentation
- ✓ Pain point analysis
- ✓ Technical architecture planning
- ✓ Success metrics definition

Deliverables box:
- Background: muted
- Title: "What you get:"
- Items: Project roadmap, Technical spec, Fixed quote

Right side - Visual:
- Abstract illustration placeholder
- Or: Card grid showing discovery activities
- Subtle animation on scroll

---END PROMPT---

## Enhanced Prompt 23: Phase 2 - Development Section

Create src/components/process/phase-development.tsx:

Layout:
- Full viewport height
- Split layout reversed: visual left, content right
- Background: muted

Left side - Visual:
- Code editor mockup with animated typing
- Or: Progress timeline visual
- Shows iterative development cycles

Right side - Content:
- Phase indicator: "Phase 2"
- Heading: "Development"
- Timeline: "4-8 weeks"
- Description: "Your vision becomes reality"

Our approach:
- ✓ Agile development sprints
- ✓ Weekly progress updates
- ✓ Early access for feedback
- ✓ Continuous testing
- ✓ Regular demos

Communication box:
- "You're always in the loop"
- Weekly video calls
- 24-hour response time
- Shared project dashboard

---END PROMPT---

## Enhanced Prompt 24: Phase 3 - Launch Section

Create src/components/process/phase-launch.tsx:

Layout:
- Full viewport height
- Split layout: content left, visual right
- White background

Left side - Content:
- Phase indicator: "Phase 3"
- Heading: "Launch"
- Timeline: "1 week"
- Description: "Smooth transition to your new system"

Launch checklist:
- ✓ Final testing & QA
- ✓ Data migration
- ✓ Team training sessions
- ✓ Documentation handoff
- ✓ Go-live support

Support commitment:
- Box with primary border
- "We're here for launch day"
- On-call support
- Quick fixes included
- Training recordings

Right side - Visual:
- Rocket launch illustration
- Or: Checklist animation

---END PROMPT---

## Enhanced Prompt 25: Phase 4 - Evolution Section

Create src/components/process/phase-evolution.tsx:

Layout:
- Full viewport height
- Centered content (no split)
- Gradient background: primary to primary-dark

Content:
- Phase indicator: "Phase 4" (white)
- Heading: "Evolution" (white)
- Timeline: "Ongoing" (white)
- Description: "Your software grows with your business" (white/90%)

Three columns of ongoing support:

1. "Continuous Improvement"
   - Regular feature updates
   - Performance optimization
   - User feedback implementation

2. "Reliable Support"
   - Bug fixes included
   - Technical support
   - Security updates

3. "Future Growth"
   - Scalability planning
   - New integrations
   - Feature roadmapping

Bottom CTA:
- "All included in your monthly subscription"
- Button: "See Pricing" (white button)

---END PROMPT---

## Enhanced Prompt 26: Interactive Timeline

Create src/components/process/process-timeline.tsx:

Add an interactive timeline section after overview:

Desktop layout:
- Horizontal timeline
- Sticky during scroll
- Progress indicator follows scroll
- Click to jump to phase

Mobile layout:
- Vertical timeline on left
- Dots indicate phases
- Current phase highlighted

Features:
- Smooth scroll to section on click
- Active phase updates on scroll
- Animated progress line
- Phase durations displayed
- Total timeline: 6-11 weeks

Visual style:
- Minimal and clean
- Primary color for active
- Muted for inactive
- Smooth transitions

---END PROMPT---

## Enhanced Prompt 27: Process Page Enhancements

Add these final enhancements:

1. Scroll animations:
   - Phases fade in on scroll
   - Stagger list items (100ms delay)
   - Progress indicators animate
   - Smooth parallax on visuals

2. Interactive elements:
   - Hover states on all cards
   - Expandable activity details
   - Tooltip explanations
   - Video modal for "See how we work"

3. Next Steps CTA section:
   - After Phase 4
   - Heading: "Ready to Start?"
   - Two CTAs side by side:
     * "Schedule a Call" (primary)
     * "Get a Quote" (outline)
   - Trust text: "No commitment needed"

4. Performance optimizations:
   - Lazy load phase sections
   - Optimize animations for 60fps
   - Preload next phase on scroll

5. Mobile refinements:
   - Reduce phase heights on mobile
   - Stack all layouts vertically
   - Simplify animations
   - Add phase navigation dots

6. Accessibility:
   - Keyboard navigation for timeline
   - Screen reader descriptions
   - Reduced motion alternatives
   - High contrast mode support

The page should tell a clear story of transformation from problem to solution, building confidence in your process.

---END PROMPT---

# Phase 4: About Page - Trust & Values

## Enhanced Prompt 28: About Page Setup & Route

Create the about page structure:

1. Create src/app/(marketing)/about/page.tsx with:
   - Page title: "Software Should Adapt to You"
   - Meta description: "We believe every business deserves custom software without enterprise pricing. Based in Houston, serving businesses everywhere."

2. Create component folder: src/components/about/

Page structure:
- Header (from phase 1)
- Hero section
- Our belief section
- Our approach section
- Why we're different
- Location/contact section
- CTA section
- Footer (from phase 1)

---END PROMPT---

## Enhanced Prompt 29: About Hero Section

Create src/components/about/about-hero.tsx:

Layout:
- Height: 600px desktop, 500px mobile
- Dark background with subtle texture/gradient
- Centered content

Content:

1. Headline: "Software Should Adapt to You"
   - Font size: 64px desktop, 48px mobile
   - White text
   - Font weight: 700

2. Subheading: "Not the other way around"
   - Font size: 32px desktop, 24px mobile
   - Opacity: 0.8
   - Margin top: 16px

Visual element:
- Animated morphing shape behind text
- Represents adaptability/flexibility
- Subtle, not distracting
- Primary color with low opacity

---END PROMPT---

## Enhanced Prompt 30: Our Belief Section

Create src/components/about/our-belief.tsx:

Layout:
- Container max-width-4xl
- 100px padding vertical
- Centered text

Heading:
- "What We Believe"
- Font size: 40px desktop, 32px mobile
- Margin bottom: 48px

Core beliefs (large, impactful text):

First block:
- "Every business is unique."
- "Your software should be too."
- Font size: 28px desktop, 24px mobile
- Line height: 1.4
- Margin bottom: 40px

Second block:
- "Custom software shouldn't require venture funding."
- Font size: 24px desktop, 20px mobile
- Color: muted-foreground

Third block (in a box):
- Background: primary/5
- Padding: 40px
- "We're building the alternative to one-size-fits-all solutions and $100k+ development projects."
- Font size: 20px
- Border radius: 16px

---END PROMPT---

## Enhanced Prompt 31: Our Approach Section

Create src/components/about/our-approach.tsx:

Layout:
- Full width background: muted
- Container max-width-6xl
- 100px padding vertical

Heading:
- "Our Approach"
- Center aligned
- Margin bottom: 60px

Three pillars (columns on desktop, stack on mobile):

1. "Modern Development"
   - Icon: Lightning bolt
   - Points:
     * Latest frameworks & tools
     * Cloud-native architecture
     * Mobile-first design
     * Automated testing

2. "Business First"
   - Icon: Briefcase
   - Points:
     * Start with your workflow
     * Speak your language
     * Focus on outcomes
     * Measure success

3. "True Partnership"
   - Icon: Handshake
   - Points:
     * Transparent pricing
     * Regular communication
     * Long-term support
     * Your success is ours

Styling:
- Card style with white background
- Icon: 48px, primary color
- Title: 24px, font-weight 600
- Points: 16px, with checkmarks
- Subtle shadow on cards

---END PROMPT---

## Enhanced Prompt 32: Why Different Section

Create src/components/about/why-different.tsx:

Layout:
- Container max-width-5xl
- 100px padding vertical
- Split layout on desktop

Left side:
- Heading: "Why We're Different"
- Font size: 40px desktop, 32px mobile

Right side:
Comparison points:

"Traditional Agencies"
- ❌ $75k+ upfront investment
- ❌ 6-12 month timelines
- ❌ Disappear after launch
- ❌ Expensive changes

"Generic Platforms"
- ❌ Force you into their mold
- ❌ Limited customization
- ❌ Monthly fees forever
- ❌ You own nothing

"Our Model" (highlighted)
- ✅ Low upfront investment
- ✅ 4-8 week delivery
- ✅ Ongoing partnership
- ✅ You own everything

Style:
- Our model: Primary background/5
- Clean typography
- Good/bad indicators colored

---END PROMPT---

## Enhanced Prompt 33: Values Section

Create src/components/about/our-values.tsx:

Layout:
- Container max-width-4xl
- 80px padding vertical

Heading:
- "Built on Strong Foundations"
- Center aligned

Four values in a 2x2 grid:

1. "Transparency"
   - "No hidden costs, no surprises, no fine print"

2. "Ownership"
   - "Your business, your software, your intellectual property"

3. "Excellence"
   - "Enterprise quality without enterprise complexity"

4. "Partnership"
   - "Your success is our success, period"

Styling:
- No cards, just clean text
- Value name: 20px, font-weight 600
- Description: 16px, muted-foreground
- Subtle dividers between values
- Animate in on scroll

---END PROMPT---

## Enhanced Prompt 34: Location Section

Create src/components/about/location-section.tsx:

Layout:
- Full width
- Split: 60% content, 40% visual
- 80px padding vertical

Content side:
- Heading: "Houston Based. Everywhere Focused."
- Subheading: "Proudly serving businesses across the United States"

Benefits list:
- ✓ Central timezone for easy collaboration
- ✓ Face-to-face meetings available locally
- ✓ Remote-first process works anywhere
- ✓ All meetings recorded for your timezone

Contact info:
- Email: contact@customsoft.com
- Location: Houston, Texas
- Response time: Within 24 hours

Visual side:
- Abstract map illustration
- Or: Stylized Houston skyline
- Primary color accent

---END PROMPT---

## Enhanced Prompt 35: Trust & Credibility Section

Create src/components/about/trust-section.tsx:

Layout:
- Container max-width-6xl
- 80px padding vertical

Heading:
- "Built for Trust"
- Center aligned

Trust elements grid (3 columns):

1. "Secure by Design"
   - Icon: Shield
   - Enterprise-grade security
   - Regular backups
   - Your data stays yours

2. "Clear Contracts"
   - Icon: Document
   - Plain English terms
   - No lock-in clauses
   - 30-day cancellation

3. "Proven Process"
   - Icon: Checklist
   - Documented methodology
   - Regular milestones
   - Success metrics

Add subtle stats:
- "100% Client Satisfaction"
- "4-Week Average Delivery"
- "Zero Hidden Fees"

Style with large numbers and small labels

---END PROMPT---

## Enhanced Prompt 36: About Page Final Touches

Add these finishing elements:

1. CTA Section:
   - Background: Primary color
   - Heading: "Let's Build Something Together"
   - Subheading: "Start with a conversation, not a commitment"
   - Two buttons:
     * "Schedule a Call" (white)
     * "Get a Quote" (white outline)

2. Page animations:
   - Smooth fade-in for sections
   - Parallax effect on hero shape
   - Stagger values animation
   - Number count-up for stats

3. Interactive elements:
   - Hover effects on value cards
   - Expandable sections for mobile
   - Smooth scroll anchors

4. SEO enhancements:
   - Schema markup for local business
   - Meta tags for Houston software development
   - Structured data for organization

5. Performance:
   - Optimize animation performance
   - Lazy load below-fold sections
   - Ensure 60fps scrolling

6. Mobile optimizations:
   - Stack all split layouts
   - Reduce font sizes appropriately
   - Simplify animations
   - Touch-friendly tap targets

The page should build trust through transparency while maintaining the premium, minimalist aesthetic that positions you as a serious alternative to both agencies and SaaS platforms.

---END PROMPT---

# Phase 5: Contact/Start Page - Lead Capture

## Enhanced Prompt 37: Contact Page Setup & Smart Form Structure

Create the contact/start page structure:

1. Create src/app/(marketing)/start/page.tsx with:
   - Page title: "Start Your Project | Get a Custom Software Quote"
   - Meta description: "Tell us about your business needs and get a custom software development quote in 48 hours. No spam, no pressure."

2. Create component folder: src/components/start/

3. Install form dependencies:
   - npm install react-hook-form zod @hookform/resolvers/zod
   - Add shadcn components: form, input, textarea, select, radio-group

Page structure:
- Header (from phase 1)
- Hero section (minimal)
- Smart questionnaire form
- Trust indicators sidebar
- Footer (from phase 1)

---END PROMPT---

## Enhanced Prompt 38: Contact Hero Section

Create src/components/start/start-hero.tsx:

Layout:
- Height: 300px (compact)
- Background: Gradient from primary/5 to transparent
- Centered content

Content:

1. Headline: "Let's Build Your Solution"
   - Font size: 48px desktop, 36px mobile
   - Font weight: 700

2. Subheading: "Get a custom quote in 48 hours"
   - Font size: 20px
   - Color: muted-foreground
   - Margin top: 16px

Progress indicator:
- 5 dots showing form progress
- Initially all muted
- Updates as form progresses

---END PROMPT---

## Enhanced Prompt 39: Smart Questionnaire Form - Part 1

Create src/components/start/project-form.tsx with progressive disclosure:

Form setup:
- Use react-hook-form with zod validation
- Multi-step with smooth transitions
- Save progress to sessionStorage
- Show step indicator at top

Step 1: Business Information

```typescript
const step1Schema = z.object({
  businessName: z.string().min(2, "Business name required"),
  industry: z.string().min(1, "Please select your industry"),
  businessSize: z.string().min(1, "Please select business size"),
  website: z.string().url().optional().or(z.literal(""))
});
```

Industries dropdown:
- Healthcare & Medical
- Professional Services
- Manufacturing
- Retail & E-commerce
- Construction & Trades
- Financial Services
- Education
- Non-profit
- Other

Business size:
- Just me (1)
- Small team (2-10)
- Growing business (11-50)
- Established company (50+)

Add smooth slide transition between steps

---END PROMPT---

## Enhanced Prompt 40: Smart Questionnaire Form - Part 2

Continue src/components/start/project-form.tsx:

Step 2: Current Challenges

```typescript
const step2Schema = z.object({
  primaryChallenge: z.string().min(10, "Please describe your main challenge"),
  currentTools: z.string().min(2, "What tools do you use now?"),
  painPoints: z.array(z.string()).min(1, "Select at least one pain point")
});
```

Pain points checkboxes:
- Too many manual processes
- Data in multiple places
- Can't get the reports I need
- Software doesn't fit our workflow
- Spending too much on multiple tools
- No mobile access
- Can't scale efficiently
- Other

Textarea for primary challenge:
- Placeholder: "What's the biggest challenge your business faces today?"
- Min height: 100px
- Character count

Current tools input:
- Placeholder: "Excel, QuickBooks, HubSpot, etc."

---END PROMPT---

## Enhanced Prompt 41: Smart Questionnaire Form - Part 3

Continue with Step 3: Desired Solution

```typescript
const step3Schema = z.object({
  solutionType: z.string().min(1, "Please select solution type"),
  keyFeatures: z.string().min(10, "Describe key features needed"),
  userCount: z.string().min(1, "Estimated users required"),
  timeline: z.string().min(1, "Please select timeline")
});
```

Solution type radio:
- Customer Management (CRM)
- Operations Management
- Financial/Accounting Tools
- Project Management
- Industry-Specific Solution
- Not sure yet

Key features textarea:
- Placeholder: "What must your solution do?"

User count dropdown:
- 1-5 users
- 6-15 users
- 16-50 users
- 50+ users

Timeline:
- ASAP (within 2 weeks)
- Within a month
- Within 3 months
- Just exploring options

---END PROMPT---

## Enhanced Prompt 42: Smart Questionnaire Form - Part 4 & 5

Step 4: Budget Expectations

```typescript
const step4Schema = z.object({
  budgetRange: z.string().min(1, "Please select budget range"),
  decisionMaker: z.boolean(),
  additionalStakeholders: z.string().optional()
});
```

Budget range:
- Under $500/month
- $500-1,000/month
- $1,000-2,500/month
- $2,500+/month
- Not sure yet

Decision maker radio:
- Yes, I make the final decision
- No, I need to consult others

Step 5: Contact Information

```typescript
const step5Schema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/).optional(),
  preferredContact: z.enum(["email", "phone", "either"]),
  additionalInfo: z.string().optional()
});
```

Add consent checkbox:
- "I agree to receive project updates and occasional insights"

---END PROMPT---

## Enhanced Prompt 43: Dynamic Quote Preview

Create src/components/start/quote-preview.tsx:

Sidebar component that updates based on form answers:

Layout:
- Sticky on desktop
- Hidden on mobile until final step
- Card style with border

Content updates dynamically:
- Estimated setup: $X,XXX (based on complexity)
- Monthly estimate: $XXX (based on users/features)
- Timeline: X-X weeks
- Recommended approach: [Based on selections]

Show/hide logic:
- After step 2: Show basic estimate range
- After step 3: Refine estimate
- After step 4: Show final estimate

Bottom of preview:
- "Final quote within 48 hours"
- Trust badges: No spam, No obligation

---END PROMPT---

## Enhanced Prompt 44: Form Submission & Success State

Add form submission handling:

Submit function:
```typescript
const onSubmit = async (data: FormData) => {
  // Show loading state
  // Submit to API endpoint
  // Track conversion
  // Save to database
  // Send confirmation email
  // Redirect to success page
};
```

Success page/state:
- Checkmark animation
- "Thank you, [Name]!"
- "We'll send your custom quote within 48 hours"

What happens next timeline:
- Within 2 hours: Confirmation email
- Within 24 hours: Initial assessment
- Within 48 hours: Detailed quote

Secondary CTA: "Browse Our Process"

Error handling:
- Inline validation messages
- Network error recovery
- Save draft functionality
- "Having issues? Email us directly"

Abandonment recovery:
- Save progress automatically
- "Continue where you left off" prompt
- Exit intent: "Need help? Chat with us"

---END PROMPT---

## Enhanced Prompt 45: Contact Page Enhancements

Add these final enhancements:

1. Trust indicators throughout:
   - "Your information is secure"
   - "No spam, ever"
   - "48-hour response guarantee"
   - SSL badge
   - Privacy link

2. Smart interactions:
   - Auto-save every field change
   - Smooth scroll between steps
   - Keyboard navigation (Enter to continue)
   - Back button functionality
   - Progress persistence

3. Analytics and tracking:
   - Form abandonment tracking
   - Time per step
   - Field interaction tracking
   - Conversion optimization

4. Alternative contact section:
   - Below form: "Prefer to email?"
   - Email: contact@customsoft.com
   - Include email template

5. Mobile optimizations:
   - Full-screen steps
   - Large touch targets (48px)
   - Native input types
   - Simplified layout
   - Fixed "Next" button

6. Performance:
   - Code split form steps
   - Debounce auto-save
   - Optimize animations
   - Preload success state

The form should feel conversational and helpful, not like a traditional contact form. Each step should build on the previous, creating a sense of momentum toward the solution.

---END PROMPT---
