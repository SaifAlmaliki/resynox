// This file defines the `createCustomerPortalSession` server action, which generates a Stripe Customer Portal session URL.
// It checks the authentication and retrieves the Stripe Customer ID from the user's metadata.
// If the session is successfully created, it returns the URL for redirecting the user to manage their subscription.

"use server";

import { env } from "@/env";
import stripe from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Creates a Stripe Customer Portal session for the current user.
 * The portal allows users to manage their Stripe subscriptions.
 *
 * @returns {string} - The URL of the Stripe Customer Portal session.
 * @throws {Error} - If the user is not authenticated, lacks a Stripe customer ID, or if session creation fails.
 */
export async function createCustomerPortalSession() {
  // Get the currently authenticated user
  const user = await currentUser();

  // If no user is authenticated, throw an error
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Retrieve the Stripe Customer ID from the user's private metadata
  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined;

  // If no Stripe Customer ID is found, throw an error
  if (!stripeCustomerId) {
    throw new Error("Stripe customer ID not found");
  }

  // Create a Stripe Customer Portal session for the authenticated user
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,                         // Stripe customer ID from the user's metadata
    return_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,  // URL to return to after managing the subscription
  });

  // If the session URL is not returned, throw an error
  if (!session.url) {
    throw new Error("Failed to create customer portal session");
  }

  // Return the session URL for redirecting the user
  return session.url;
}