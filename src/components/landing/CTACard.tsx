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
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-md border border-white/20 text-center hover:bg-white/15 transition-colors flex flex-col h-full">
      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/80 mb-auto">
        {description}
      </p>
      <div className="mt-6">
        <Button 
          asChild 
          size="lg"
          variant="secondary"
          className="w-full group rounded-full px-6 py-4 text-green-900 bg-white hover:bg-green-50 border border-green-100"
        >
          <Link href={href}>
            {buttonText} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 