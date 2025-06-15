import { env } from "@/env"; // Import environment variables
import { cache } from "react"; // Cache utility to optimize repeated calls
import prisma from "./prisma"; // Prisma client for database access

// Define the possible subscription levels
export type SubscriptionLevel = "free" | "pro" | "pro_plus";


export const getUserSubscriptionLevel = cache(
  async (userId: string): Promise<SubscriptionLevel> => {
    // Fetch the user's subscription from the database
    const subscription = await prisma.userSubscription.findUnique({
      where: {
        userId, // Filter by user ID
      },
    });

    // If no subscription exists or it has expired, default to "free"
    if (!subscription || !subscription.stripeCurrentPeriodEnd || subscription.stripeCurrentPeriodEnd < new Date()) {
      return "free";
    }

    // Determine subscription level based on Stripe price ID
    if (subscription.stripePriceId) {
      // Check against environment variables for Pro plan
      if (subscription.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY) {
        return 'pro';
      }
      
      // Check against environment variables for Pro Plus plan
      if (subscription.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY) {
        return 'pro_plus';
      }
      
      // If we have a subscription with a price ID that doesn't match current env vars
      // Check if it contains identifiable substrings
      const priceId = subscription.stripePriceId.toLowerCase();
      
      // Check for Pro Plus subscription based on naming pattern
      if (priceId.includes('pro_plus') || priceId.includes('proplus')) {
        return 'pro_plus';
      }
      
      // Check for Pro subscription based on naming pattern
      if (priceId.includes('pro')) {
        return 'pro';
      }
    }

    // Log the subscription for debugging
    console.log("Subscription found but couldn't determine plan type:", subscription.stripePriceId);
    
    // Default to "free" for any active subscription that we can't identify
    // This ensures the app doesn't crash if a subscription can't be identified
    return "free";
  }
);
