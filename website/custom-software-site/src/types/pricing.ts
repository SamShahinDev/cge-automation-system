export interface PricingTier {
  id: string;
  name: string;
  setupFee: string;
  monthlyFee: string;
  description: string;
  features: string[];
  timeline: string;
  featured?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ComparisonRow {
  approach: string;
  cost: string;
  ownership: string;
  flexibility: string;
  support: string;
  highlighted?: boolean;
}
