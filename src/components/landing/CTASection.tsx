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
  ctas: Array<{
    icon: any;
    title: string;
    description: string;
    buttonText: string;
    href: string;
  }>;
}

export function CTASection({ title, subtitle, ctas }: CTASectionProps) {
  return (
    <div id="cta-section" className="bg-gradient-to-r from-green-900 to-green-800 rounded-xl p-6 md:p-8 shadow-md text-white mb-16 animate-fade-in-up border border-green-700/30 relative overflow-hidden" style={{ animationDelay: '1s' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="relative z-10">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{title}</h2>
          <p className="max-w-2xl mx-auto text-green-100 text-base md:text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto stagger-container">
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
        
        {/* Bottom CTA */}
        <div className="text-center mt-8 md:mt-12 pt-6 md:pt-8 border-t border-green-700/30">
          <p className="text-green-100 mb-4 text-sm md:text-base">
            <strong>Ready to transform your job search?</strong> Join thousands of professionals who've already landed their dream jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center items-center text-xs md:text-sm">
            <div className="text-green-200">
              ✓ No credit card required
            </div>
            <div className="text-green-200">
              ✓ Start building in minutes
            </div>
            <div className="text-green-200">
              ✓ Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 