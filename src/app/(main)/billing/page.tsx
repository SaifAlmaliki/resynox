// Billing page that shows subscription details and management options

import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import Stripe from "stripe";
import GetSubscriptionButton from "./GetSubscriptionButton";
import ManageSubscriptionButton from "./ManageSubscriptionButton";


export const metadata: Metadata = {
  title: "Billing",
};


export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  // Safely resolve Stripe price info. Avoid calling Stripe for placeholder/free tiers.
  let priceInfo: Stripe.Price | null = null;
  const priceId = subscription?.stripePriceId;
  if (priceId && priceId !== "free_tier") {
    try {
      priceInfo = await stripe.prices.retrieve(priceId, { expand: ["product"] });
    } catch {
      priceInfo = null;
    }
  }


  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      <h1 className="text-3xl font-bold">Billing</h1>


      <p>
        Your current plan: {" "}
        <span className="font-bold">
          {priceInfo ? (priceInfo.product as Stripe.Product).name : "Free"}
        </span>
      </p>


      {subscription ? (
        <>
          {subscription.stripeCancelAtPeriodEnd && (
            <p className="text-destructive">
              Your subscription will be canceled on {" "}
              {formatDate(subscription.stripeCurrentPeriodEnd, "MMMM dd, yyyy")}
            </p>
          )}

          <ManageSubscriptionButton />
        </>
      ) : (

        <GetSubscriptionButton />
      )}
    </main>
  );
}
