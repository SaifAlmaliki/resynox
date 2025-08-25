import { LucideIcon, Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  icon?: LucideIcon;
}

export function TestimonialCard({ name, role, content, rating, icon: Icon }: TestimonialCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
      {/* Quote icon */}
      <div className="absolute top-4 right-4 text-green-800/20 dark:text-green-100/20">
        <Quote className="h-8 w-8" />
      </div>
      
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 rounded-full bg-green-900/10 dark:bg-green-900/30 flex items-center justify-center mr-4 border border-green-800/20">
          {Icon ? (
            <Icon className="h-6 w-6 text-green-800 dark:text-green-100" />
          ) : (
            <div className="h-6 w-6 bg-green-800 dark:bg-green-100 rounded-full" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-sm text-green-800 dark:text-green-100 font-medium">{role}</p>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed italic">
        &quot;{content}&quot;
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex text-yellow-400">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star 
              key={index} 
              className={`h-5 w-5 ${index < rating ? 'fill-current' : ''}`} 
            />
          ))}
        </div>
        <div className="text-sm text-green-800 dark:text-green-100 font-medium">
          Verified Success
        </div>
      </div>
    </div>
  );
} 