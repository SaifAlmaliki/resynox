import { LucideIcon } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
  step: string;
}

interface HowItWorksSectionProps {
  title: string;
  subtitle: string;
  steps: Step[];
}

export function HowItWorksSection({ title, subtitle, steps }: HowItWorksSectionProps) {
  return (
    <div id="how-it-works" className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-container">
        {steps.map((step, index) => (
          <div key={index} className="stagger-item" style={{ '--item-index': index } as any}>
            <FeatureCard
              icon={step.icon}
              title={step.title}
              description={step.description}
              step={step.step}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 