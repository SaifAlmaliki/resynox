// Server action to create a Stripe Customer Portal session

"use server";

import { env } from "@/env";
import stripe from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";

export async function createCustomerPortalSession() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined;

  if (!stripeCustomerId) {
    throw new Error("Stripe customer ID not found");
  }

  // Create a customer portal session with the default configuration
  // This will show all available subscription options to the customer
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,
  });

  if (!session.url) {
    throw new Error("Failed to create customer portal session");
  }

  return session.url;
}