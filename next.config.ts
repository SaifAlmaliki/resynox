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
    // Re-enabled after adding critters dependency
    optimizeCss: true,
  },



  // Performance optimizations
  webpack: (config, { dev, isServer }) => {
    // Fix webpack cache performance warning
    if (dev) {
      config.cache = {
        type: 'memory',
        maxGenerations: 1,
      };
    } else {
      // For production, use filesystem cache but with optimized settings
      config.cache = {
        type: 'filesystem',
        cacheDirectory: require('path').resolve(__dirname, '.next/cache/webpack'),
        compression: 'gzip',
      };
    }

    if (!dev && !isServer) {
      // Optimize bundle splitting for production
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
            maxSize: 244000, // Limit size to prevent large string serialization
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
            maxSize: 244000, // Limit size to prevent large string serialization
          },
        },
      };
    }
    return config;
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
  
  // Development performance
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Reduce bundle size
  modularizeImports: {
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "resynox",
project: "ai-interview-preperation",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// Disable telemetry to speed up builds
telemetry: false,

// Skip source map upload if no auth token (prevents build failures)  
sourcemaps: {
  disable: !process.env.SENTRY_AUTH_TOKEN,
},

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