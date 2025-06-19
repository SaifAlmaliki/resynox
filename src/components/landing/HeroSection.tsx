import { Button } from "@/components/ui/button";
import { SplineScene } from "@/components/ui/spline-scene";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight } from "lucide-react";

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
  splineScene: string;
}

export function HeroSection({ 
  title, 
  subtitle, 
  primaryCTA, 
  secondaryCTA, 
  splineScene 
}: HeroSectionProps) {
  return (
    <div className="w-full bg-black/[0.96] relative overflow-hidden rounded-xl shadow-2xl border-0 mb-16 animate-fade-in-up">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="flex flex-col md:flex-row h-[750px] md:h-[600px]">
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-start md:justify-center pt-4 md:pt-0">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-100 to-green-900 tracking-tight">
            {title}
          </h1>
          
          <p className="mt-6 text-neutral-300 text-lg max-w-lg">
            {subtitle}
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              asChild 
              size="lg" 
              variant="premium"
              className="group rounded-full px-8 py-6 text-lg"
            >
              <a href={primaryCTA.href}>
                {primaryCTA.text}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="group rounded-full px-8 py-6 text-lg bg-transparent border-green-800 text-green-100 hover:bg-green-900/20 hover:text-green-100"
            >
              <a href={secondaryCTA.href}>
                {secondaryCTA.text}
              </a>
            </Button>
          </div>
        </div>

        <div className="flex-1 relative order-first md:order-last mb-0 md:mb-0 h-[350px] md:h-full">
          <SplineScene 
            scene={splineScene}
            className="w-full h-full scale-125 md:scale-100"
          />
        </div>
      </div>
    </div>
  );
} 