import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  step?: number;
}

export function FeatureCard({ icon: Icon, title, description, step }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col group">
      <div className="h-16 w-16 rounded-full bg-green-900/10 dark:bg-green-900/30 flex items-center justify-center mb-4 mx-auto border border-green-800/20 group-hover:bg-green-900/20 dark:group-hover:bg-green-900/40 transition-colors">
        <Icon className="h-8 w-8 text-green-800 dark:text-green-100" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
        {step && (
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-900 text-white text-sm font-bold mr-2">
            {step}
          </span>
        )}
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
        {description}
      </p>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-green-800 dark:text-green-100 font-medium">
          {step === 1 && "Get past ATS systems"}
          {step === 2 && "Stand out to hiring managers"}
          {step === 3 && "Build real confidence"}
          {step === 4 && "Track your progress"}
        </div>
      </div>
    </div>
  );
}