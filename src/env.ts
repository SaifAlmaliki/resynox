import { createEnv } from "@t3-oss/env-nextjs"; // Utility to create and manage environment variables in Next.js
import { z } from "zod";

// Define and export the `env` object
export const env = createEnv({
  // Define server-side environment variables
  server: {
    POSTGRES_URL: z.string().min(1),                    // URL for PostgreSQL database
    POSTGRES_PRISMA_URL: z.string().min(1),             // URL for Prisma integration with PostgreSQL
    POSTGRES_USER: z.string().min(1),                   // PostgreSQL username
    POSTGRES_HOST: z.string().min(1),                   // PostgreSQL host
    POSTGRES_PASSWORD: z.string().min(1),               // PostgreSQL password
    POSTGRES_DATABASE: z.string().min(1),               // PostgreSQL database name
    CLERK_SECRET_KEY: z.string().min(1),                // Secret key for Clerk authentication service
    BLOB_READ_WRITE_TOKEN: z.string().min(1),           // Token for read/write access to a blob storage
    OPENAI_API_KEY: z.string().min(1),                  // API key for OpenAI services
    STRIPE_SECRET_KEY: z.string().min(1),               // Stripe secret key for handling payments
    STRIPE_WEBHOOK_SECRET: z.string().min(1),           // Stripe webhook secret for verifying incoming webhook events
  },

  // Define client-side environment variables
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),             // Publishable key for Clerk, used on the client-side
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),                 // Clerk sign-in URL
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1),                 // Clerk sign-up URL
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),            // Publishable key for Stripe, used on the client-side
    NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY: z.string().min(1),       // Price ID for Stripe Pro Monthly subscription
    NEXT_PUBLIC_BASE_URL: z.string().min(1).url(),                    // Base URL for the application (must be a valid URL)
  },

  // Map environment variables to their respective runtime values
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
  },
});
