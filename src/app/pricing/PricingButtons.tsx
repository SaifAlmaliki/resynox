"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/components/premium/actions";
import Link from "next/link";
import { useState } from "react";

interface PricingButtonsProps {
  plan: "pro" | "pro_plus";
  currentSubscription: string;
  isAuthenticated: boolean;
}

export default function PricingButtons({ 
  plan, 
  currentSubscription, 
  isAuthenticated 
}: PricingButtonsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      // Redirect to sign in if not authenticated
      window.location.href = "/sign-in";
      return;
    }

    try {
      setLoading(true);
      const priceId = plan === "pro" 
        ? env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY
        : env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY;
      
      const redirectUrl = await createCheckoutSession(priceId);
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // If user already has this plan or higher
  if (
    (plan === "pro" && (currentSubscription === "pro" || currentSubscription === "pro_plus")) ||
    (plan === "pro_plus" && currentSubscription === "pro_plus")
  ) {
    return (
      <div className="w-full py-3 px-6 rounded-lg bg-white/20 text-white/70 text-center font-medium">
        Current Plan
      </div>
    );
  }

  // If user has pro and looking at pro_plus, show upgrade option
  if (plan === "pro_plus" && currentSubscription === "pro") {
    return (
      <Button 
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-3 px-6 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
      >
        {loading ? "Processing..." : "Upgrade to Pro Plus"}
      </Button>
    );
  }

  // If user has pro_plus and looking at pro, show manage subscription
  if (plan === "pro" && currentSubscription === "pro_plus") {
    return (
      <Button asChild className="w-full py-3 px-6 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium">
        <Link href="/billing">
          Manage Subscription
        </Link>
      </Button>
    );
  }

  // Default case - show upgrade/subscribe button
  const buttonText = plan === "pro" ? "Start Pro Trial" : "Get Pro Plus";

  return (
    <Button 
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full py-3 px-6 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
    >
      {loading ? "Processing..." : buttonText}
    </Button>
  );
} 