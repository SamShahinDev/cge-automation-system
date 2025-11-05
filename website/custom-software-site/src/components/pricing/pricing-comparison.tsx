import { Check, X } from 'lucide-react';

const comparisonData = {
  categories: [
    { label: "Approach", key: "approach" },
    { label: "Initial Cost", key: "cost" },
    { label: "Monthly Cost", key: "monthly" },
    { label: "Code Ownership", key: "ownership" },
    { label: "Customization", key: "customization" },
    { label: "Ongoing Support", key: "support" },
    { label: "Timeline", key: "timeline" }
  ],
  options: [
    {
      name: "Generic SaaS",
      tagline: "HubSpot, Salesforce, etc.",
      highlighted: false,
      features: {
        approach: "One-size-fits-all platform",
        cost: "$0 - $1,000",
        monthly: "$200 - $500/mo forever",
        ownership: { value: false, text: "You own nothing" },
        customization: { value: false, text: "Limited to their features" },
        support: { value: "partial", text: "Generic support" },
        timeline: "Immediate setup"
      }
    },
    {
      name: "Crowned Software",
      tagline: "That's us!",
      highlighted: true,
      features: {
        approach: "Custom built for you",
        cost: "$2,000 - $10,000",
        monthly: "$500 - $2,500/mo",
        ownership: { value: true, text: "100% yours, always" },
        customization: { value: true, text: "Built for your needs" },
        support: { value: true, text: "Included & proactive" },
        timeline: "4-8 weeks"
      }
    }
  ]
};

type FeatureValue = string | { value: boolean | string; text: string };

const renderCell = (value: FeatureValue) => {
  if (typeof value === 'string') {
    return <span className="text-gray-700 dark:text-gray-300">{value}</span>;
  }

  if (value.value === true) {
    return (
      <div className="flex items-center gap-2">
        <Check className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
        <span className="text-gray-700 dark:text-gray-300">{value.text}</span>
      </div>
    );
  }

  if (value.value === false) {
    return (
      <div className="flex items-center gap-2">
        <X className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0" />
        <span className="text-gray-700 dark:text-gray-300">{value.text}</span>
      </div>
    );
  }

  return <span className="text-gray-700 dark:text-gray-300">{value.text}</span>;
};

export function PricingComparison() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How We Compare
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See how Crowned Software stacks up against traditional options
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Features
                  </span>
                </th>
                {comparisonData.options.map((option) => (
                  <th
                    key={option.name}
                    className={`p-4 text-center border-b-2 ${
                      option.highlighted
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {option.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {option.tagline}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.categories.map((category, idx) => (
                <tr
                  key={category.key}
                  className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}
                >
                  <td className="p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    {category.label}
                  </td>
                  {comparisonData.options.map((option) => (
                    <td
                      key={option.name}
                      className={`p-4 border-b ${
                        option.highlighted
                          ? 'bg-blue-50/50 dark:bg-blue-900/10 border-gray-200 dark:border-gray-700'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-center">
                        {renderCell(option.features[category.key as keyof typeof option.features])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-6">
          {comparisonData.options.map((option) => (
            <div
              key={option.name}
              className={`rounded-lg border-2 overflow-hidden ${
                option.highlighted
                  ? 'border-blue-500 dark:border-blue-600 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div
                className={`p-6 ${
                  option.highlighted
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {option.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {option.tagline}
                </p>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {comparisonData.categories.map((category) => (
                  <div key={category.key} className="p-4 bg-white dark:bg-gray-900">
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      {category.label}
                    </div>
                    <div>
                      {renderCell(option.features[category.key as keyof typeof option.features])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
