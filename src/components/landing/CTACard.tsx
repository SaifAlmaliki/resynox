import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";

interface CTACardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export function CTACard({ icon: Icon, title, description, buttonText, href }: CTACardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-md border border-white/20 text-center hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full group">
      <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto group-hover:bg-white/30 transition-colors">
        <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-white/80 mb-auto leading-relaxed text-sm md:text-base">
        {description}
      </p>
      <div className="mt-6">
        <Button 
          asChild 
          size="lg"
          variant="secondary"
          className="w-full group/btn rounded-full px-4 md:px-6 py-3 md:py-4 text-sm md:text-base text-green-900 bg-white hover:bg-green-50 border border-green-100 font-semibold transition-all duration-300 hover:scale-105 whitespace-normal"
        >
          <Link href={href}>
            {buttonText} <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4 transition-transform group-hover/btn:translate-x-1 flex-shrink-0" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 