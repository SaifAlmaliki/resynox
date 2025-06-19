'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startNavigation } from './page-navigation';
import { ReactNode, useState } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  replace?: boolean;
}

export function NavLink({ href, children, className = "", replace = false }: NavLinkProps) {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsClicked(true);
    startNavigation();
    
    if (replace) {
      router.replace(href);
    } else {
      router.push(href);
    }

    // Reset clicked state after a short delay
    setTimeout(() => setIsClicked(false), 1000);
  };

  return (
    <button
      onClick={handleClick}
      className={`${className} transition-all duration-200 ${
        isClicked ? 'opacity-75 scale-95' : 'hover:scale-105'
      }`}
      disabled={isClicked}
    >
      {children}
    </button>
  );
}

// Enhanced card component for clickable items
interface ClickableCardProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function ClickableCard({ href, children, className = "" }: ClickableCardProps) {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    startNavigation();
    router.push(href);
    
    setTimeout(() => setIsClicked(false), 1000);
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-200 ${
        isClicked 
          ? 'scale-95 opacity-75' 
          : 'hover:scale-[1.02] hover:shadow-lg'
      } ${className}`}
    >
      {children}
      {isClicked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        </div>
      )}
    </div>
  );
} 