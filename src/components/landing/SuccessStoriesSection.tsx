import { TestimonialCard } from "./TestimonialCard";

interface SuccessStoriesSectionProps {
  title: string;
  subtitle: string;
  testimonials: Array<{
    name: string;
    role: string; 
    content: string;
    rating: number;
    icon: any;
  }>;
}

export function SuccessStoriesSection({ title, subtitle, testimonials }: SuccessStoriesSectionProps) {
  return (
    <div className="mb-16 bg-green-900/10 dark:bg-green-900/20 rounded-xl p-8 shadow-md animate-fade-in-up border border-green-800/20" style={{ animationDelay: '0.6s' }}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-container">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="stagger-item" style={{ '--item-index': index } as any}>
            <TestimonialCard
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              rating={testimonial.rating}
              icon={testimonial.icon}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 