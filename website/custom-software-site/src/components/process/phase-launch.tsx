import { CheckCircle2, Rocket, Shield, LineChart } from 'lucide-react';

export function PhaseLaunch() {
  const launchItems = [
    {
      icon: CheckCircle2,
      title: 'Final Testing',
      description: 'Comprehensive testing across all environments and devices'
    },
    {
      icon: Rocket,
      title: 'Deployment',
      description: 'Smooth rollout with zero-downtime deployment strategies'
    },
    {
      icon: Shield,
      title: 'Monitoring Setup',
      description: 'Real-time performance monitoring and error tracking'
    },
    {
      icon: LineChart,
      title: 'Performance Optimization',
      description: 'Fine-tuning for optimal speed and efficiency'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6">
          <Rocket className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-3xl font-bold mb-4">Phase 3: Launch & Support</h3>
        <p className="text-lg text-muted-foreground">
          We ensure a smooth launch and provide ongoing support to keep your software running flawlessly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        {launchItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex gap-4 p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-8 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800">
        <h4 className="text-2xl font-bold mb-4 text-center">Our Commitment to You</h4>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">30 Days</div>
            <p className="text-sm text-muted-foreground">Post-launch support included</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">24/7</div>
            <p className="text-sm text-muted-foreground">Monitoring and alerts</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">100%</div>
            <p className="text-sm text-muted-foreground">Satisfaction guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
}
