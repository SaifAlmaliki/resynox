
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
    if (!subscription || subscription.stripeCurrentPeriodEnd < new Date()) {
      return "free";
    }

    // Check for "pro" subscription level
    if (subscription.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY) {
      return "pro";
    }

    // Check for "pro_plus" subscription level
    if (subscription.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY) {
      return "pro_plus";
    }

    // Throw an error if an unknown or invalid subscription is found
    throw new Error("Invalid subscription");
  }
);
