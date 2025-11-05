import { Shield, FileText, CheckSquare } from 'lucide-react';

export default function TrustSection() {
  const trustElements = [
    {
      icon: Shield,
      title: 'Secure by Design',
      features: [
        'Enterprise-grade security',
        'Regular backups',
        'Your data stays yours'
      ]
    },
    {
      icon: FileText,
      title: 'Clear Contracts',
      features: [
        'Plain English terms',
        'No lock-in clauses',
        '30-day cancellation'
      ]
    },
    {
      icon: CheckSquare,
      title: 'Proven Process',
      features: [
        'Documented methodology',
        'Regular milestones',
        'Success metrics'
      ]
    }
  ];

  const stats = [
    { number: '100%', label: 'Client Satisfaction' },
    { number: '4-Week', label: 'Average Delivery' },
    { number: 'Zero', label: 'Hidden Fees' }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Built for Trust
        </h2>

        {/* Trust Elements Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {trustElements.map((element, index) => {
            const Icon = element.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  <Icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  {element.title}
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  {element.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
