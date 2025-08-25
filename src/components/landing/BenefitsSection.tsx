import { LucideIcon } from "lucide-react";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  stat: string;
}

interface BenefitsSectionProps {
  title: string;
  subtitle: string;
  benefits: Benefit[];
}

export function BenefitsSection({ title, subtitle, benefits }: BenefitsSectionProps) {
  return (
    <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-container">
        {benefits.map((benefit, index) => {
          type CSSWithVar = React.CSSProperties & { ['--item-index']?: number };
          const itemStyle: CSSWithVar = { ['--item-index']: index };
          return (
            <div key={index} className="stagger-item" style={itemStyle}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="h-16 w-16 rounded-full bg-green-900/10 dark:bg-green-900/30 flex items-center justify-center mb-4 mx-auto border border-green-800/20">
                  <benefit.icon className="h-8 w-8 text-green-800 dark:text-green-100" />
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                  {benefit.description}
                </p>
                <div className="bg-green-900/10 dark:bg-green-900/20 rounded-lg p-3 border border-green-800/20">
                  <p className="text-green-800 dark:text-green-100 font-bold text-lg">
                    {benefit.stat}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
