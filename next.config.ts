import {withSentryConfig} from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during build to prevent deployment failures
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // The 'experimental' property is used for Next.js experimental features.
  // Here, we are configuring the maximum allowed body size for server actions.
  // Setting 'bodySizeLimit' to '4mb' means that server actions can handle up to 4 MB of request body data.
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
    optimizeCss: true,
  },

  // The 'images' configuration specifies allowed domains and patterns for remote images.
  // This is necessary if you are serving images from a remote source.
  images: {
    // 'remotePatterns' allows you to define a list of remote image sources that are allowed by Next.js's Image component.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ycpy9sns92utpex7.public.blob.vercel-storage.com"
        // Here, images served from this specific hostname over HTTPS
        // are considered allowed and can be optimized by Next.js.
      }
    ]
  },

  // Add these optimizations:
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "resynox",
project: "ai-interview-preperation",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});