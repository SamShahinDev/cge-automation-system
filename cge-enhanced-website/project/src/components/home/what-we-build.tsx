'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'

interface BuildCapability {
  title: string
  description: string
}

const capabilities: BuildCapability[] = [
  {
    title: 'Customer Management Systems',
    description: 'Track customers, sales, and relationships exactly how you need',
  },
  {
    title: 'Internal Tools & Dashboards',
    description: "Custom dashboards and tools for your team's unique workflow",
  },
  {
    title: 'Workflow Automation',
    description: 'Automate repetitive tasks with software built for your process',
  },
  {
    title: 'Industry-Specific Solutions',
    description: 'Specialized solutions for healthcare, manufacturing, and more',
  },
]

export function WhatWeBuild() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="py-[120px] md:py-[60px] px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="text-[48px] md:text-[36px] font-bold text-center mb-[60px]">
          What We Build
        </h2>

        {/* Grid of capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((capability, index) => (
            <Card
              key={index}
              className="p-8 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg"
              style={{
                transform: hoveredIndex === index ? 'scale(1.02)' : 'scale(1)',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <h3 className="text-xl font-semibold mb-3">
                {capability.title}
              </h3>
              <p
                className="text-base text-muted-foreground transition-opacity duration-300"
                style={{
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
              >
                {capability.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
