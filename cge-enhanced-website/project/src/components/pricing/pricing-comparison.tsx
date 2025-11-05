"use client";

import { Check, X, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ComparisonRow {
  approach: string;
  cost: string;
  costDetails?: string;
  ownership: string;
  ownershipDetails?: string;
  flexibility: string;
  flexibilityDetails?: string;
  support: string;
  supportDetails?: string;
  highlighted?: boolean;
}

const comparisonData: ComparisonRow[] = [
  {
    approach: "Generic SaaS",
    cost: "$200-500/mo forever",
    costDetails: "Recurring monthly fees with no end date. Costs increase with more users or features.",
    ownership: "You own nothing",
    ownershipDetails: "All code and data remains with the vendor. If they go out of business, you lose everything.",
    flexibility: "Limited customization",
    flexibilityDetails: "Only what the vendor offers. Feature requests may take months or never happen.",
    support: "Generic support",
    supportDetails: "Shared support team handling thousands of customers. Long response times.",
  },
  {
    approach: "Traditional Development",
    cost: "$75,000+ upfront",
    costDetails: "Large upfront payment for development. Additional costs for maintenance, hosting, and updates.",
    ownership: "You own it (usually)",
    ownershipDetails: "Code ownership varies by contract. May include licensing fees or restrictions.",
    flexibility: "Very flexible",
    flexibilityDetails: "Full control over features and changes, but expensive to implement.",
    support: "Expensive to maintain",
    supportDetails: "Ongoing maintenance contracts often cost $1,000+/month. No guarantee of availability.",
  },
  {
    approach: "Crowned Software",
    cost: "Low setup + monthly",
    costDetails: "Affordable setup fee ($2,000-$8,000) plus predictable monthly hosting ($500-$1,500).",
    ownership: "You own everything",
    ownershipDetails: "100% code ownership from day one. All source code, documentation, and assets are yours.",
    flexibility: "Built for you",
    flexibilityDetails: "Custom-built specifically for your business needs. Easy to modify and extend.",
    support: "Included support",
    supportDetails: "Dedicated support, hosting, security updates, and maintenance included in monthly fee.",
    highlighted: true,
  },
];

export function PricingComparison() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const TooltipCell = ({ content, details }: { content: string; details?: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center gap-1 cursor-help">
            {content}
            {details && <Info className="h-3 w-3 text-muted-foreground" />}
          </span>
        </TooltipTrigger>
        {details && (
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{details}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <section id="comparison" className="py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center mb-15">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Compare Your Options
          </h2>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 font-semibold text-foreground">
                  Approach
                </th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">
                  Cost
                </th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">
                  Ownership
                </th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">
                  Flexibility
                </th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">
                  Support
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <>
                  <tr
                    key={index}
                    className={`border-b border-border last:border-b-0 transition-all duration-200 cursor-pointer ${
                      row.highlighted
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/30 hover:shadow-md"
                    } ${expandedRow === index ? "bg-muted/40" : ""}`}
                    onClick={() => toggleRow(index)}
                  >
                    <td className="py-4 px-6 font-medium text-foreground">
                      {row.approach}
                      {row.highlighted && (
                        <span className="ml-2 text-xs text-primary font-semibold">
                          <Check className="inline h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      <TooltipCell content={row.cost} details={row.costDetails} />
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      <TooltipCell content={row.ownership} details={row.ownershipDetails} />
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      <TooltipCell content={row.flexibility} details={row.flexibilityDetails} />
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      <TooltipCell content={row.support} details={row.supportDetails} />
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {expandedRow === index ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr className="bg-muted/20">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold mb-1">Cost Details:</p>
                            <p className="text-muted-foreground">{row.costDetails}</p>
                          </div>
                          <div>
                            <p className="font-semibold mb-1">Ownership Details:</p>
                            <p className="text-muted-foreground">{row.ownershipDetails}</p>
                          </div>
                          <div>
                            <p className="font-semibold mb-1">Flexibility Details:</p>
                            <p className="text-muted-foreground">{row.flexibilityDetails}</p>
                          </div>
                          <div>
                            <p className="font-semibold mb-1">Support Details:</p>
                            <p className="text-muted-foreground">{row.supportDetails}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {comparisonData.map((row, index) => {
            const isExpanded = expandedRow === index;
            return (
              <div
                key={index}
                className={`bg-card border rounded-lg p-5 shadow-sm transition-all duration-200 cursor-pointer ${
                  row.highlighted
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:shadow-md"
                } ${isExpanded ? "ring-2 ring-muted" : ""}`}
                onClick={() => toggleRow(index)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">
                    {row.approach}
                  </h3>
                  <div className="flex items-center gap-2">
                    {row.highlighted && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">
                      Cost:
                    </span>
                    <span className="text-sm text-foreground text-right flex-1 ml-4">
                      {row.cost}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">
                      Ownership:
                    </span>
                    <span className="text-sm text-foreground text-right flex-1 ml-4">
                      {row.ownership}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">
                      Flexibility:
                    </span>
                    <span className="text-sm text-foreground text-right flex-1 ml-4">
                      {row.flexibility}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">
                      Support:
                    </span>
                    <span className="text-sm text-foreground text-right flex-1 ml-4">
                      {row.support}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <p className="text-xs font-semibold mb-1">Cost Details:</p>
                      <p className="text-xs text-muted-foreground">{row.costDetails}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1">Ownership Details:</p>
                      <p className="text-xs text-muted-foreground">{row.ownershipDetails}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1">Flexibility Details:</p>
                      <p className="text-xs text-muted-foreground">{row.flexibilityDetails}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1">Support Details:</p>
                      <p className="text-xs text-muted-foreground">{row.supportDetails}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
