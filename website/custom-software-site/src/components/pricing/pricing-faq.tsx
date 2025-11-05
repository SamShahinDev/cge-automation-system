'use client';

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

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

interface PricingFAQProps {
  className?: string;
}

export function PricingFAQ({ className }: PricingFAQProps) {
  const [openItem, setOpenItem] = useState<string>("");
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      className={cn(
        "section-padding bg-muted",
        className
      )}
    >
      <div className="container-width">
        <div className="max-w-3xl mx-auto">
          <h2
            className={cn(
              "text-3xl md:text-4xl font-bold tracking-tight mb-12 text-center transition-all duration-700",
              isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Frequently Asked Questions
          </h2>
          <Accordion
            ref={ref as React.RefObject<HTMLDivElement>}
            type="single"
            collapsible
            className="w-full"
            value={openItem}
            onValueChange={setOpenItem}
          >
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={cn(
                  "transition-all duration-200",
                  isIntersecting ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                  openItem === `item-${index}` && "border-l-4 border-primary pl-4"
                )}
                style={{
                  transitionDelay: isIntersecting ? `${index * 100}ms` : '0ms'
                }}
              >
                <AccordionTrigger
                  className="text-left touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-200",
                        openItem === `item-${index}`
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="ml-10">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
