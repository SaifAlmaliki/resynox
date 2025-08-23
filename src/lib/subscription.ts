
import { env } from "@/env"; // Import environment variables
import { cache } from "react"; // Cache utility to optimize repeated calls
import prisma from "./prisma"; // Prisma client for database access

// Define the possible subscription levels
export type SubscriptionLevel = "free" | "pro" | "pro_plus";


export const getUserSubscriptionLevel = cache(
  async (userId: string): Promise<SubscriptionLevel> => {
    // Fetch the user's subscription from the database
    let subscription: Awaited<ReturnType<typeof prisma.userSubscription.findUnique>> | null = null;
    try {
      subscription = await prisma.userSubscription.findUnique({
        where: {
          userId, // Filter by user ID
        },
      });
    } catch (err) {
      // If DB is unreachable (e.g., local dev without DB), default to free to avoid crashing the app
      console.warn("getUserSubscriptionLevel: prisma error, defaulting to 'free'", err);
      return "free";
    }

    // If no subscription exists or it has expired, default to "free"
    if (!subscription || !subscription.stripeCurrentPeriodEnd || subscription.stripeCurrentPeriodEnd < new Date()) {
      return "free";
    }

    // Determine subscription level based on price ID
    if (subscription.stripePriceId) {
      // Check against environment variables for exact matches
      if (subscription.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY) {
        return 'pro';
      }
      
      if (subscription.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY) {
        return 'pro_plus';
      }
      
      // If we have a subscription with a price ID that doesn't match current env vars
      // Check if it contains identifiable substrings
      const priceId = subscription.stripePriceId.toLowerCase();
      
      // Explicitly treat any free markers as free tier
      if (priceId.includes('free')) {
        return 'free';
      }

      // Check for Pro Plus subscription based on naming pattern
      if (priceId.includes('pro_plus') || priceId.includes('proplus')) {
        return 'pro_plus';
      }
      
      // Default to Pro for any other Stripe subscription
      return 'pro';
    }

    // Log the invalid subscription for debugging
    console.log("Invalid subscription with price ID:", subscription.stripePriceId);
    
    // Default to "free" to avoid granting unintended access when price ID is unknown
    return "free";
  }
);
