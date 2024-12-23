"use server";

/*
 * createCheckoutSession Function
 *
 * This file defines a server-side function to create a Stripe Checkout Session
 * for a subscription. It ensures that only authenticated users can create a
 * session and integrates with Stripe for managing the checkout process.
 *
 * Key Features:
 * - Fetches the current user using Clerk (authentication provider).
 * - Checks for a Stripe Customer ID in the user's metadata.
 * - Creates a Stripe Checkout session for a subscription plan.
 * - Handles consent collection and terms of service acceptance.
 * - Returns the session URL for redirecting the user to Stripe Checkout.
 *
 * Parameters:
 * - priceId (string): The Stripe price ID for the subscription plan.
 *
 * Dependencies:
 * - env: Environment variables for base URLs.
 * - stripe: Stripe SDK for interacting with the Stripe API.
 * - currentUser: Clerk function to fetch the current authenticated user.
 */

import { env } from "@/env";        // Environment variables (NEXT_PUBLIC_BASE_URL)
import stripe from "@/lib/stripe";  // Stripe client instance
import { currentUser } from "@clerk/nextjs/server"; // Clerk function to get user data

/**
 * Creates a Stripe Checkout Session for a subscription.
 *
 * @param {string} priceId - The Stripe price ID for the subscription plan.
 * @returns {Promise<string>} - The Stripe Checkout session URL.
 * @throws {Error} - Throws error if user is unauthorized or session creation fails.
 */
export async function createCheckoutSession(priceId: string): Promise<string> {
  // Fetch the current authenticated user
  const user = await currentUser();

  // If no user is found, throw an unauthorized error
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Retrieve Stripe Customer ID from the user's private metadata
  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined;

  // Prepare customer email (only if Stripe Customer ID does not exist)
  const customerEmail = stripeCustomerId ? undefined : user.emailAddresses[0].emailAddress;

  // Create a new Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    // Line item: subscription product with the given price ID
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription", // Mode set to 'subscription'

    // URLs to redirect the user upon success or cancellation
    success_url: `${env.NEXT_PUBLIC_BASE_URL}/billing/success`,
    cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,

    // Customer details
    customer: stripeCustomerId,
    customer_email: customerEmail,

    // Metadata for tracking the user ID
    metadata: {
      userId: user.id
    },
    subscription_data: {
      metadata: { userId: user.id },
    },

    // Custom text for terms of service acceptance
    custom_text: {
      terms_of_service_acceptance: {
        message: `I have read AI Resume Builder's [terms of service](${env.NEXT_PUBLIC_BASE_URL}/tos) and agree to them.`,
      },
    },

    // Terms of service consent requirement
    consent_collection: { terms_of_service: "required" },
  });

  // Validate session creation and return the session URL
  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return session.url; // Return the URL for Stripe Checkout
}
