'use client';

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsLoading(true);
    setDisplayChildren(children);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div className={`page-transition-container ${className}`}>
      <div 
        className={`transition-all duration-300 ease-out ${
          isLoading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        {displayChildren}
      </div>
    </div>
  );
}

// Lightweight stagger animations using CSS
export function StaggerContainer({ 
  children, 
  className = "",
  delay = 0.1 
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <div className={`stagger-container ${className}`} style={{ '--stagger-delay': `${delay}s` } as any}>
      {children}
    </div>
  );
}

export function StaggerItem({ 
  children, 
  className = "",
  index = 0
}: { 
  children: ReactNode; 
  className?: string;
  index?: number;
}) {
  return (
    <div 
      className={`stagger-item ${className}`}
      style={{ '--item-index': index } as any}
    >
      {children}
    </div>
  );
} 