'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Zap, Briefcase, Handshake, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const pillars = [
  {
    icon: Zap,
    title: 'Modern Development',
    points: [
      'Latest frameworks & tools',
      'Cloud-native architecture',
      'Mobile-first design',
      'Automated testing',
    ],
  },
  {
    icon: Briefcase,
    title: 'Business First',
    points: [
      'Start with your workflow',
      'Speak your language',
      'Focus on outcomes',
      'Measure success',
    ],
  },
  {
    icon: Handshake,
    title: 'True Partnership',
    points: [
      'Transparent pricing',
      'Regular communication',
      'Long-term support',
      'Your success is ours',
    ],
  },
]

export default function OurApproach() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="w-full bg-muted py-[100px]">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Heading */}
        <h2 className="text-center text-[40px] md:text-[32px] font-bold mb-[60px]">
          Our Approach
        </h2>

        {/* Pillars Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
        >
          {pillars.map((pillar, index) => {
            const IconComponent = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
              >
                <Card className="h-full bg-background shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    {/* Icon */}
                    <div className="mb-6">
                      <IconComponent
                        className="text-primary"
                        size={48}
                        strokeWidth={2}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-[24px] font-semibold mb-6">
                      {pillar.title}
                    </h3>

                    {/* Points List */}
                    <ul className="space-y-3">
                      {pillar.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 text-[16px]"
                        >
                          <Check
                            className="text-primary flex-shrink-0 mt-0.5"
                            size={20}
                            strokeWidth={2.5}
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
