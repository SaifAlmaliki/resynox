// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry in production to speed up development
if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: "https://31400b67e737b1c37921e735856861cd@o4509541580013568.ingest.de.sentry.io/4509541597053008",

    // Add optional integrations for additional features
    integrations: [
      Sentry.replayIntegration(),
    ],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
} else {
  console.log('🚀 Client-side instrumentation disabled in development mode');
}

export const onRouterTransitionStart = process.env.NODE_ENV !== 'development' 
  ? Sentry.captureRouterTransitionStart 
  : () => {};