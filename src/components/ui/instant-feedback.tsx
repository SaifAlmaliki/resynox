'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleLoader } from './progress-loader';

// Hook to provide instant feedback on navigation
export function useInstantFeedback() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const navigateWithFeedback = (href: string) => {
    setIsNavigating(true);
    router.push(href);
    
    // Reset after navigation timeout
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  return { isNavigating, navigateWithFeedback };
}

// Enhanced button that shows immediate feedback
interface FeedbackButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function FeedbackButton({ href, children, className = "", disabled }: FeedbackButtonProps) {
  const { isNavigating, navigateWithFeedback } = useInstantFeedback();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      navigateWithFeedback(href);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || isNavigating}
        className={`relative ${className} ${
          isNavigating ? 'opacity-75 cursor-wait' : ''
        } transition-all duration-200`}
      >
        {isNavigating ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : (
          children
        )}
      </button>
      <SimpleLoader isVisible={isNavigating} />
    </>
  );
}

// Optimistic loading component for cards/items
export function OptimisticCard({ 
  children, 
  href, 
  className = "" 
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  const { isNavigating, navigateWithFeedback } = useInstantFeedback();

  return (
    <div
      onClick={() => navigateWithFeedback(href)}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isNavigating ? 'scale-95 opacity-75' : 'hover:scale-[1.02]'
      } ${className}`}
    >
      {children}
      {isNavigating && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Opening...
          </div>
        </div>
      )}
    </div>
  );
}

// Progress toast for long operations
export function ProgressToast({ 
  isVisible, 
  message = "Loading...", 
  progress 
}: {
  isVisible: boolean;
  message?: string;
  progress?: number;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 min-w-[300px]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
          {progress !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Loading</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className="h-1 bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 