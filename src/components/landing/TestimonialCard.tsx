import { LucideIcon, Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  icon?: LucideIcon;
}

export function TestimonialCard({ name, role, content, rating, icon: Icon }: TestimonialCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
          {Icon ? (
            <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          ) : (
            <div className="h-6 w-6 bg-gray-400 rounded-full" />
          )}
        </div>
        <div>
          <h3 className="font-bold">{name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        &quot;{content}&quot;
      </p>
      <div className="flex text-yellow-400">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star 
            key={index} 
            className={`h-5 w-5 ${index < rating ? 'fill-current' : ''}`} 
          />
        ))}
      </div>
    </div>
  );
} 