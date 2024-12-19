/*
 * File: subscription.ts
 * Purpose: Provides a utility function to determine the subscription level of a user.
 *
 * Description:
 * - This file defines the `getUserSubscriptionLevel` function.
 * - It fetches the user's subscription data from the database using Prisma.
 * - The function determines the user's current subscription level ("free", "pro", "pro_plus").
 * - Caching is applied for optimization, ensuring that repeated calls for the same user do not hit the database unnecessarily.
 */

import { env } from "@/env"; // Import environment variables
import { cache } from "react"; // Cache utility to optimize repeated calls
import prisma from "./prisma"; // Prisma client for database access

// Define the possible subscription levels
export type SubscriptionLevel = "free" | "pro" | "pro_plus";

/**
 * Determines the subscription level of a user.
 *
 * @param userId - The ID of the user whose subscription level is to be determined.
 * @returns {Promise<SubscriptionLevel>} - The user's current subscription level.
 *
 * Logic:
 * 1. Fetch the user's subscription from the database.
 * 2. If no subscription exists or it has expired, return "free".
 * 3. Compare the user's Stripe subscription price ID to environment variables:
 *    - If matches `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY`, return "pro".
 *    - If matches `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY`, return "pro_plus".
 * 4. Throw an error if the subscription price ID is invalid.
 *
 * Optimization:
 * - Caching ensures that subsequent calls with the same `userId` return the cached result.
 */
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
    if ( subscription.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY) {
      return "pro";
    }

    // Check for "pro_plus" subscription level
    if (subscription.stripePriceId ===env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY) {
      return "pro_plus";
    }

    // Throw an error if an unknown or invalid subscription is found
    throw new Error("Invalid subscription");
  }
);
