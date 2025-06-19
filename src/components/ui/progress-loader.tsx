'use client';

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressLoaderProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  className?: string;
}

const loadingMessages = [
  "Preparing your workspace...",
  "Loading components...",
  "Optimizing for performance...",
  "Setting up your data...",
  "Almost ready...",
  "Finalizing setup..."
];

export function ProgressLoader({ 
  isLoading, 
  progress, 
  message,
  className 
}: ProgressLoaderProps) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    // Auto-increment progress if not provided
    let progressInterval: NodeJS.Timeout;
    if (progress === undefined) {
      progressInterval = setInterval(() => {
        setCurrentProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 3;
        });
      }, 200);
    } else {
      setCurrentProgress(progress);
    }

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => {
        const next = (prev + 1) % loadingMessages.length;
        setCurrentMessage(loadingMessages[next]);
        return next;
      });
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isLoading, progress]);

  // Reset when loading stops
  useEffect(() => {
    if (!isLoading) {
      setCurrentProgress(0);
      setMessageIndex(0);
      setCurrentMessage(loadingMessages[0]);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
      className
    )}>
      <div className="w-full max-w-md mx-auto p-8 space-y-6">
        {/* Logo/Brand area */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-green-900 to-green-800 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-green-100 border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Loading</h3>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{message || currentMessage}</span>
            <span>{Math.round(currentProgress)}%</span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-900 to-green-800 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* Fun loading indicators */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-green-800 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>

        {/* Tips or hints */}
        <div className="text-center text-sm text-muted-foreground">
          <p>💡 Tip: Your resume data is being optimized for the best experience</p>
        </div>
      </div>
    </div>
  );
}

// Simple loading overlay for quick transitions
export function SimpleLoader({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-all duration-200">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-green-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    </div>
  );
} 