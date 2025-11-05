"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What's included in the setup fee?",
    answer:
      "Discovery sessions to understand your business, custom design and architecture, initial development and testing, and training and deployment.",
  },
  {
    question: "What does the monthly fee cover?",
    answer:
      "Hosting and infrastructure, security updates and backups, bug fixes and minor updates, and email support.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "12-month initial commitment, month-to-month after that, 30-day notice to cancel, and you keep all code.",
  },
  {
    question: "Do I really own the code?",
    answer:
      "Yes, 100% ownership transfers to you. We provide all source code, full documentation included, and there's no vendor lock-in.",
  },
  {
    question: "How do you keep costs so low?",
    answer:
      "Modern development practices, efficient project management, no corporate overhead, and focused scope definition.",
  },
];

export function PricingFAQ() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;

    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-primary/20 text-foreground">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Common Questions
          </h2>

          {/* Search Input */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No questions found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible defaultValue="item-0">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {highlightText(faq.question, searchQuery)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {highlightText(faq.answer, searchQuery)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {searchQuery && filteredFaqs.length > 0 && (
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Found {filteredFaqs.length} of {faqs.length} questions
          </div>
        )}
      </div>
    </section>
  );
}
