// Global TypeScript types

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  };
}

export interface NavigationItem {
  name: string;
  href: string;
  current?: boolean;
}

export interface PricingPlan {
  name: string;
  description: string;
  setupPrice: string;
  monthlyPrice: string;
  features: string[];
  highlighted?: boolean;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}