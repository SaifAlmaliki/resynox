import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight, CheckCircle } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA: {
    text: string;
    href: string;
  };
}

export function HeroSection({ 
  title, 
  subtitle, 
  primaryCTA, 
  secondaryCTA 
}: HeroSectionProps) {
  return (
    <div className="w-full bg-black/[0.96] relative overflow-hidden rounded-xl shadow-2xl border-0 mb-16 animate-fade-in-up">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="flex flex-col min-h-[600px] md:min-h-[700px]">
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center items-center text-center pt-8 md:pt-12 pb-8 md:pb-12">
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/20 text-green-100 border border-green-800/30">
              <CheckCircle className="w-4 h-4 mr-2" />
              Trusted by 500+ professionals
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-100 to-green-900 tracking-tight">
            {title}
          </h1>
          
          <p className="mt-6 text-neutral-300 text-lg max-w-lg leading-relaxed">
            {subtitle}
          </p>
          
          {/* Key Benefits */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center text-green-100">
              <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
              <span className="text-sm md:text-base">ATS-optimized resumes that get past screening systems</span>
            </div>
            <div className="flex items-center text-green-100">
              <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
              <span className="text-sm md:text-base">AI-generated cover letters that hiring managers love</span>
            </div>
            <div className="flex items-center text-green-100">
              <CheckCircle className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
              <span className="text-sm md:text-base">Realistic voice interviews that build confidence</span>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              asChild 
              size="lg" 
              variant="premium"
              className="group rounded-full px-6 md:px-10 py-5 md:py-7 text-sm md:text-lg whitespace-normal font-semibold"
            >
              <a href={primaryCTA.href}>
                {primaryCTA.text}
                <ArrowRight className="ml-3 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1 flex-shrink-0" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="group rounded-full px-6 md:px-10 py-5 md:py-7 text-sm md:text-lg bg-transparent border-green-800 text-green-100 hover:bg-green-900/20 hover:text-green-100 whitespace-normal font-semibold"
            >
              <a href={secondaryCTA.href}>
                {secondaryCTA.text}
              </a>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-8 pt-6 border-t border-green-800/30">
            <p className="text-sm text-green-200/70 mb-3">Join professionals from top companies:</p>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-green-200/60">
              <span>Google</span>
              <span className="hidden md:inline">•</span>
              <span>Amazon</span>
              <span className="hidden md:inline">•</span>
              <span>Meta</span>
              <span className="hidden md:inline">•</span>
              <span>Microsoft</span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
} 