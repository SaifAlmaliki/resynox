'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function useRouterProgress() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const startLoading = () => {
      setIsLoading(true);
      setProgress(0);

      // Simulate progress for better UX during long loads
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      // Auto-complete after 30 seconds (for very long loads)
      timeoutId = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, 500);
      }, 30000);
    };

    const finishLoading = () => {
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    };

    // Override router.push to detect navigation
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (...args: Parameters<typeof router.push>) => {
      startLoading();
      return originalPush.apply(router, args);
    };

    router.replace = (...args: Parameters<typeof router.replace>) => {
      startLoading();
      return originalReplace.apply(router, args);
    };

    // Listen for actual route changes to stop loading
    const handleRouteChange = () => {
      finishLoading();
    };

    // Cleanup on pathname change (route completed)
    const timeoutCleanup = setTimeout(handleRouteChange, 100);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
      clearTimeout(timeoutCleanup);
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [pathname, router]);

  return { isLoading, progress };
} 