'use client';

import { usePathname } from "next/navigation";
import { Suspense, ReactNode } from "react";
import { PageTransition } from "./page-transition";
import { ProgressLoader } from "./progress-loader";
import { useRouterProgress } from "@/hooks/useRouterProgress";
import { 
  ResumePageSkeleton, 
  InterviewPageSkeleton, 
  CoverLetterPageSkeleton 
} from "./loading-skeleton";

interface LoadingWrapperProps {
  children: ReactNode;
}

// Map routes to their skeleton components
const getPageSkeleton = (pathname: string) => {
  if (pathname.includes('/resumes')) return <ResumePageSkeleton />;
  if (pathname.includes('/interview')) return <InterviewPageSkeleton />;
  if (pathname.includes('/cover-letters')) return <CoverLetterPageSkeleton />;
  
  // Default skeleton for other pages
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="container mx-auto py-8 space-y-6">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function LoadingWrapper({ children }: LoadingWrapperProps) {
  const pathname = usePathname();
  const { isLoading, progress } = useRouterProgress();

  return (
    <>
      {/* Router progress indicator */}
      <ProgressLoader isLoading={isLoading} progress={progress} />
      
      {/* Page content with transitions */}
      <PageTransition>
        <Suspense fallback={getPageSkeleton(pathname)}>
          {children}
        </Suspense>
      </PageTransition>
    </>
  );
}

// Top loading bar for quick visual feedback
export function TopLoadingBar({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gradient-to-r from-green-900 to-green-800 progress-bar"></div>
    </div>
  );
} 