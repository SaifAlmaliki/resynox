// Summary:
// This file defines a `Page` component that displays billing information for the authenticated user.
// It fetches subscription details from the database and Stripe, showing the current plan and subscription status.
// Users can either manage their subscription or subscribe to a plan.

import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import Stripe from "stripe";
import GetSubscriptionButton from "./GetSubscriptionButton";
import ManageSubscriptionButton from "./ManageSubscriptionButton";

// Page metadata for the Billing page
export const metadata: Metadata = {
  title: "Billing",
};

/**
 * Billing Page Component
 * Displays billing details for the authenticated user.
 *
 * @returns JSX.Element - The rendered billing page.
 */
export default async function Page() {
  // Retrieve the authenticated user's ID
  const { userId } = await auth();

  // If no user is authenticated, return null (nothing to render)
  if (!userId) {
    return null;
  }

  // Fetch the user's subscription details from the database
  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  // Fetch the subscription price information from Stripe, if a subscription exists
  const priceInfo = subscription
    ? await stripe.prices.retrieve(subscription.stripePriceId, {
        expand: ["product"],
      })
    : null;

  // Render the billing page content
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      <h1 className="text-3xl font-bold">Billing</h1>

      {/* Display the user's current plan */}
      <p>
        Your current plan: {" "}
        <span className="font-bold">
          {priceInfo ? (priceInfo.product as Stripe.Product).name : "Free"}
        </span>
      </p>

      {/* Conditionally render Managed subscription details if active subscription */}
      {subscription ? (
        <>
          {subscription.stripeCancelAtPeriodEnd && (
            <p className="text-destructive">
              Your subscription will be canceled on {" "}
              {formatDate(subscription.stripeCurrentPeriodEnd, "MMMM dd, yyyy")}
            </p>
          )}
          {/* Button to manage an active subscription */}
          <ManageSubscriptionButton />
        </>
      ) : (
        // Button to subscribe if no active subscription exists
        <GetSubscriptionButton />
      )}
    </main>
  );
}
