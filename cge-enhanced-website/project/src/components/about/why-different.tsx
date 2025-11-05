'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { X, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ComparisonPoint {
  text: string
  good: boolean
}

interface ComparisonColumn {
  title: string
  points: ComparisonPoint[]
  highlighted?: boolean
}

const comparisonColumns: ComparisonColumn[] = [
  {
    title: 'Traditional Agencies',
    points: [
      { text: '$75k+ upfront investment', good: false },
      { text: '6-12 month timelines', good: false },
      { text: 'Disappear after launch', good: false },
      { text: 'Expensive changes', good: false },
    ],
  },
  {
    title: 'Generic Platforms',
    points: [
      { text: 'Force you into their mold', good: false },
      { text: 'Limited customization', good: false },
      { text: 'Monthly fees forever', good: false },
      { text: 'You own nothing', good: false },
    ],
  },
  {
    title: 'Our Model',
    points: [
      { text: 'Low upfront investment', good: true },
      { text: '4-8 week delivery', good: true },
      { text: 'Ongoing partnership', good: true },
      { text: 'You own everything', good: true },
    ],
    highlighted: true,
  },
]

export default function WhyDifferent() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="w-full py-[100px]">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Split Layout - Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Side - Heading */}
          <div className="lg:col-span-4">
            <h2 className="text-[32px] md:text-[40px] font-bold leading-tight">
              Why We&apos;re Different
            </h2>
          </div>

          {/* Right Side - Comparison Points */}
          <div ref={ref} className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisonColumns.map((column, columnIndex) => (
                <motion.div
                  key={column.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                  }
                  transition={{
                    duration: 0.6,
                    delay: columnIndex * 0.15,
                  }}
                >
                  <Card
                    className={`h-full shadow-sm hover:shadow-md transition-shadow duration-300 ${
                      column.highlighted
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-background'
                    }`}
                  >
                    <CardContent className="p-6">
                      {/* Column Title */}
                      <h3
                        className={`text-[18px] font-semibold mb-6 ${
                          column.highlighted ? 'text-primary' : ''
                        }`}
                      >
                        {column.title}
                      </h3>

                      {/* Points List */}
                      <ul className="space-y-4">
                        {column.points.map((point, pointIndex) => (
                          <li
                            key={pointIndex}
                            className="flex items-start gap-3 text-[15px]"
                          >
                            {point.good ? (
                              <Check
                                className="text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5"
                                size={18}
                                strokeWidth={2.5}
                              />
                            ) : (
                              <X
                                className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5"
                                size={18}
                                strokeWidth={2.5}
                              />
                            )}
                            <span className="leading-relaxed">
                              {point.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
