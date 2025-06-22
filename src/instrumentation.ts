import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Only enable instrumentation in production to speed up development
  if (process.env.NODE_ENV !== 'development') {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('../sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('../sentry.edge.config');
    }
  } else {
    console.log('🚀 Instrumentation disabled in development mode for faster builds');
  }
}

export const onRequestError = process.env.NODE_ENV !== 'development' 
  ? Sentry.captureRequestError 
  : () => {};
