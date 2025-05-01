"use server";

import { env } from "@/env";
import stripe from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";

/**
 * This file contains server-side actions for handling Stripe checkout sessions.
 * It includes a function to create a checkout session for premium subscriptions.
 */

export async function createCheckoutSession(priceId: string) {
  // Fetch the current authenticated user
  const user = await currentUser();

  // Throw an error if the user is not authenticated
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Retrieve the Stripe customer ID from the user's private metadata
  const stripeCustomerId = user.privateMetadata.stripeCustomerId as
    | string
    | undefined;

  // Create a Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }], // Add the selected price to the checkout
    mode: "subscription", // Set the mode to subscription
    success_url: `${env.NEXT_PUBLIC_BASE_URL}/billing/success`, // Redirect URL after successful payment
    cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`, // Redirect URL if the user cancels
    customer: stripeCustomerId, // Use existing Stripe customer ID if available
    customer_email: stripeCustomerId
      ? undefined
      : user.emailAddresses[0].emailAddress, // Use user's email if no Stripe customer ID exists
    metadata: {
      userId: user.id, // Store user ID in metadata for reference
    },
    subscription_data: {
      metadata: {
        userId: user.id, // Store user ID in subscription metadata
      },
    },
    custom_text: {
      terms_of_service_acceptance: {
        message: `I have read AI Resume Builder's [terms of service](${env.NEXT_PUBLIC_BASE_URL}/tos) and agree to them.`, // Custom terms of service message
      },
    },
    consent_collection: {
      terms_of_service: "required", // Require acceptance of terms of service
    },
  });

  // Throw an error if the session URL is not generated
  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  // Return the checkout session URL
  return session.url;
}