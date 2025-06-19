import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  step?: string;
}

export function FeatureCard({ icon: Icon, title, description, step }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-shadow">
      <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 mx-auto">
        <Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-xl font-bold mb-2">
        {step && `${step}. `}{title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
} 