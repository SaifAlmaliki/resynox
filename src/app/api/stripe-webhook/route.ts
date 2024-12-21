import { env } from "@/env";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import Stripe from "stripe";
/**
 * Stripe Webhook Handler for Next.js
 *
 * This file sets up a Stripe webhook endpoint to securely process events sent by Stripe.
 * It listens for specific webhook events such as successful checkouts, subscription creation,
 * updates, and deletions, and performs necessary actions in the database and Clerk user metadata.
 */

// Main webhook handler for POST requests from Stripe
export async function POST(req: NextRequest) {
  try {
    // Get the raw request payload and Stripe signature from headers
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Verify that the webhook request includes a Stripe signature
    if (!signature) {
      return new Response("Signature is missing", { status: 400 });
    }

    // Verify the webhook event using Stripe's signature verification
    // This ensures the webhook is legitimately from Stripe
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );

    // Log the received event for debugging purposes
    console.log(`Received event: ${event.type}`, event.data.object);

    // Handle different types of Stripe webhook events
    switch (event.type) {
      case "checkout.session.completed":
        // Handle successful checkout completion
        await handleSessionCompleted(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        // Handle new subscriptions and subscription updates
        await handleSubscriptionCreatedOrUpdated(event.data.object.id);
        break;
      case "customer.subscription.deleted":
        // Handle subscription cancellations
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        // Log any unhandled event types
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }

    return new Response("Event received", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}

// Handler for completed checkout sessions
// Updates user metadata in Clerk with their Stripe customer ID
async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    throw new Error("User ID is missing in session metadata");
  }

  // Update Clerk user metadata with Stripe customer ID for future reference
  await (await clerkClient()).users.updateUserMetadata(userId, {
    privateMetadata: {
      stripeCustomerId: session.customer as string,
    },
  });
}

// Handler for subscription creation and updates
// Manages subscription data in the database
async function handleSubscriptionCreatedOrUpdated(subscriptionId: string) {
  // Fetch the full subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Handle active, trialing, or past due subscriptions
  if (
    subscription.status === "active" ||
    subscription.status === "trialing" ||
    subscription.status === "past_due"
  ) {
    // Upsert (create or update) the subscription in our database
    await prisma.userSubscription.upsert({
      where: {
        userId: subscription.metadata.userId,
      },
      create: {
        // Create new subscription record with all necessary fields
        userId: subscription.metadata.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
        stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      update: {
        // Update existing subscription with new price and period info
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
        stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  } else {
    // Remove not active subscription from database if it's not in a valid state (not active, not trailing, not past_due)
    await prisma.userSubscription.deleteMany({
      where: {
        stripeCustomerId: subscription.customer as string,
      },
    });
  }
}

// Handler for deleted subscriptions
// Removes the subscription from our database
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.userSubscription.deleteMany({
    where: {
      stripeCustomerId: subscription.customer as string,
    },
  });
}
