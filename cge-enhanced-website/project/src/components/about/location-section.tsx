'use client'

import { Check, Mail, MapPin, Clock } from 'lucide-react'
import { AnimatedSection } from '@/components/ui/animated-section'

const benefits = [
  'Central timezone for easy collaboration',
  'Face-to-face meetings available locally',
  'Remote-first process works anywhere',
  'All meetings recorded for your timezone',
]

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@customsoft.com',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Houston, Texas',
  },
  {
    icon: Clock,
    label: 'Response time',
    value: 'Within 24 hours',
  },
]

export default function LocationSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-16 items-center">
          {/* Content Side - 60% */}
          <AnimatedSection animation="slide-up" duration={600}>
            <div className="space-y-12">
              {/* Heading */}
              <div className="space-y-4">
                <h2 className="text-[40px] md:text-[32px] sm:text-[32px] font-bold leading-tight">
                  Houston Based.
                  <br />
                  Everywhere Focused.
                </h2>
                <p className="text-[20px] text-muted-foreground">
                  Proudly serving businesses across the United States
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <AnimatedSection
                    key={benefit}
                    animation="slide-up"
                    delay={index * 100}
                    duration={500}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                        </div>
                      </div>
                      <p className="text-[18px] leading-relaxed">{benefit}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

              {/* Contact Info */}
              <div className="pt-8 space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <AnimatedSection
                      key={info.label}
                      animation="fade"
                      delay={400 + index * 100}
                      duration={500}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="text-[14px] text-muted-foreground">{info.label}</p>
                          <p className="text-[16px] font-medium">{info.value}</p>
                        </div>
                      </div>
                    </AnimatedSection>
                  )
                })}
              </div>
            </div>
          </AnimatedSection>

          {/* Visual Side - 40% */}
          <AnimatedSection animation="fade" delay={200} duration={800}>
            <div className="relative aspect-square lg:aspect-[4/5] flex items-center justify-center">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl" />

              {/* Abstract map illustration */}
              <div className="relative w-full h-full flex items-center justify-center p-12">
                {/* Stylized Houston skyline - abstract geometric representation */}
                <div className="relative w-full h-2/3 flex items-end justify-center gap-2">
                  {/* Building shapes */}
                  <div className="w-12 h-[40%] bg-primary/20 rounded-t-sm" />
                  <div className="w-16 h-[60%] bg-primary/30 rounded-t-sm relative">
                    {/* Accent on tallest building */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary/40 rounded-full blur-xl" />
                  </div>
                  <div className="w-10 h-[45%] bg-primary/25 rounded-t-sm" />
                  <div className="w-14 h-[70%] bg-primary/35 rounded-t-sm" />
                  <div className="w-10 h-[35%] bg-primary/20 rounded-t-sm" />
                  <div className="w-12 h-[50%] bg-primary/30 rounded-t-sm" />
                </div>

                {/* Connecting lines - representing connections across US */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 400 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Radiating lines from center */}
                  <line
                    x1="200"
                    y1="240"
                    x2="100"
                    y2="100"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                    opacity="0.2"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="200"
                    y1="240"
                    x2="300"
                    y2="120"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                    opacity="0.2"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="200"
                    y1="240"
                    x2="80"
                    y2="200"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                    opacity="0.2"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="200"
                    y1="240"
                    x2="320"
                    y2="220"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                    opacity="0.2"
                    strokeDasharray="4 4"
                  />

                  {/* Connection dots */}
                  <circle cx="100" cy="100" r="3" fill="hsl(var(--primary))" opacity="0.4" />
                  <circle cx="300" cy="120" r="3" fill="hsl(var(--primary))" opacity="0.4" />
                  <circle cx="80" cy="200" r="3" fill="hsl(var(--primary))" opacity="0.4" />
                  <circle cx="320" cy="220" r="3" fill="hsl(var(--primary))" opacity="0.4" />

                  {/* Center dot - Houston */}
                  <circle cx="200" cy="240" r="6" fill="hsl(var(--primary))" opacity="0.6" />
                  <circle cx="200" cy="240" r="10" fill="hsl(var(--primary))" opacity="0.2" />
                </svg>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
