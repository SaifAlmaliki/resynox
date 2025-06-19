'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Global navigation state
let isNavigatingGlobally = false;
let navigationListeners: Array<(isLoading: boolean) => void> = [];

export function useNavigationState() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const listener = (loading: boolean) => setIsLoading(loading);
    navigationListeners.push(listener);

    return () => {
      navigationListeners = navigationListeners.filter(l => l !== listener);
    };
  }, []);

  useEffect(() => {
    // Reset loading state when pathname changes (navigation complete)
    if (isNavigatingGlobally) {
      isNavigatingGlobally = false;
      navigationListeners.forEach(listener => listener(false));
    }
  }, [pathname]);

  return isLoading;
}

export function startNavigation() {
  isNavigatingGlobally = true;
  navigationListeners.forEach(listener => listener(true));
}

// Navigation progress indicator component
export function NavigationProgress() {
  const isLoading = useNavigationState();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <>
      {/* Top loading bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-gradient-to-r from-green-900 to-green-800 transition-all duration-300 ease-out"
               style={{ width: `${progress}%` }} />
        </div>
      )}
    </>
  );
}