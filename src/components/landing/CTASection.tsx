import { LucideIcon } from "lucide-react";
import { CTACard } from "./CTACard";

interface CTA {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

interface CTASectionProps {
  title: string;
  subtitle: string;
  ctas: CTA[];
}

export function CTASection({ title, subtitle, ctas }: CTASectionProps) {
  return (
    <div id="cta-section" className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 shadow-md text-white mb-16 animate-fade-in-up" style={{ animationDelay: '1s' }}>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto stagger-container">
        {ctas.map((cta, index) => (
          <div key={index} className="stagger-item" style={{ '--item-index': index } as any}>
            <CTACard
              icon={cta.icon}
              title={cta.title}
              description={cta.description}
              buttonText={cta.buttonText}
              href={cta.href}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 