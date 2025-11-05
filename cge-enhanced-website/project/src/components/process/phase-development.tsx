'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Code, GitBranch, MessageSquare, Video, Clock } from 'lucide-react';

const codeLines = [
  "import { useEffect } from 'react';",
  "",
  "function ProductCatalog() {",
  "  useEffect(() => {",
  "    fetchProducts();",
  "  }, []);",
  "",
  "  return (",
  "    <div className='grid'>",
  "      {products.map(item => (",
  "        <ProductCard key={item.id} />",
  "      ))}",
  "    </div>",
  "  );",
  "}",
];

const developmentApproach = [
  'Agile development sprints',
  'Weekly progress updates',
  'Early access for feedback',
  'Continuous testing',
  'Regular demos',
];

const communicationFeatures = [
  { icon: Video, text: 'Weekly video calls' },
  { icon: Clock, text: '24-hour response time' },
  { icon: GitBranch, text: 'Shared project dashboard' },
];

export default function PhaseDevelopment() {
  const [typedCode, setTypedCode] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine < codeLines.length) {
      const line = codeLines[currentLine];

      if (currentChar < line.length) {
        const timeout = setTimeout(() => {
          setTypedCode(prev => {
            const newCode = [...prev];
            if (newCode[currentLine]) {
              newCode[currentLine] = line.slice(0, currentChar + 1);
            } else {
              newCode[currentLine] = line.charAt(0);
            }
            return newCode;
          });
          setCurrentChar(prev => prev + 1);
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setCurrentLine(prev => prev + 1);
          setCurrentChar(0);
        }, 200);
        return () => clearTimeout(timeout);
      }
    } else {
      // Reset animation after completion
      const resetTimeout = setTimeout(() => {
        setTypedCode([]);
        setCurrentLine(0);
        setCurrentChar(0);
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }
  }, [currentLine, currentChar]);

  return (
    <section className="min-h-screen bg-muted">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              {/* Code Editor Mockup */}
              <div className="bg-slate-900 rounded-lg shadow-2xl overflow-hidden border border-slate-700">
                {/* Editor Header */}
                <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="ml-4 flex items-center gap-2 text-slate-400 text-sm">
                    <Code className="w-4 h-4" />
                    <span>ProductCatalog.tsx</span>
                  </div>
                </div>

                {/* Editor Content */}
                <div className="p-6 font-mono text-sm min-h-[400px]">
                  {typedCode.map((line, index) => (
                    <div key={index} className="leading-6">
                      {line === '' ? (
                        <span className="text-transparent">.</span>
                      ) : (
                        <span className="text-slate-300">
                          {line}
                          {index === currentLine && (
                            <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" />
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Progress Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -right-4 top-1/4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Sprint 3</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute -right-4 bottom-1/4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Sprint 4</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2 space-y-8"
          >
            {/* Phase Indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm font-semibold text-primary">Phase 2</span>
            </div>

            {/* Heading */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Development
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="text-lg">4-8 weeks</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xl text-muted-foreground">
              Your vision becomes reality
            </p>

            {/* Our Approach */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Our approach:</h3>
              <div className="space-y-3">
                {developmentApproach.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-lg">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Communication Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-semibold">
                  You&apos;re always in the loop
                </h4>
              </div>

              <div className="space-y-3">
                {communicationFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{feature.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
