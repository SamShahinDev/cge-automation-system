"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: 1,
    title: "We Learn Your Business",
    description: "Deep dive into your workflows and needs",
  },
  {
    number: 2,
    title: "We Build Your Solution",
    description: "Custom software crafted for your exact requirements",
  },
  {
    number: 3,
    title: "You Pay Monthly, Own Forever",
    description: "Affordable payments, full ownership",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="w-full bg-muted py-[120px]">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center text-5xl font-bold mb-16 md:text-5xl sm:text-4xl"
        >
          How It Works
        </motion.h2>

        <div ref={ref} className="relative">
          {/* Desktop Timeline - Horizontal */}
          <div className="hidden md:block">
            <div className="flex justify-between items-start relative">
              {/* Connecting line */}
              <div className="absolute top-5 left-0 right-0 h-[2px] bg-border z-0 mx-[5%]" />

              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                  }
                  transition={{
                    duration: 0.6,
                    delay: index * 0.2,
                  }}
                  className="flex-1 flex flex-col items-center relative z-10"
                >
                  {/* Number circle */}
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-6">
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="text-center max-w-[280px]">
                    <h3 className="text-xl font-semibold mb-3">
                      {step.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline - Vertical */}
          <div className="md:hidden space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30 }}
                animate={
                  isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
                }
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                }}
                className="flex gap-6 relative"
              >
                {/* Number circle with line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {step.number}
                  </div>
                  {/* Connecting line for mobile (except last item) */}
                  {index < steps.length - 1 && (
                    <div className="w-[2px] h-full bg-border mt-4 min-h-[60px]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
