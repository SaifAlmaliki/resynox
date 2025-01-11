"use client";

import { env } from "@/env";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { createCheckoutSession } from "./actions";

/**
 * This file contains the PremiumModal component, which displays a dialog for users
 * to subscribe to premium plans. It includes two subscription tiers: Premium and Premium Plus.
 */

// Define features for Premium and Premium Plus plans
const premiumFeatures = [
  "AI Cover Letter Personalized from your resume",
  "AI Professional career summaries",
  "AI Experience Optimizer to enhance work descriptions",
  "Up to 3 resumes"
];

const premiumPlusFeatures = [
  "All AI features included",
  "Infinite resumes",
  "Advanced design customizations"
];

export default function PremiumModal() {
  // Hook to manage the modal's open/close state
  const { open, setOpen } = usePremiumModal();

  // Hook to display toast notifications
  const { toast } = useToast();

  // State to manage loading state during checkout session creation
  const [loading, setLoading] = useState(false);

  // Function to handle the click event for premium subscription buttons
  async function handlePremiumClick(priceId: string) {
    try {
      setLoading(true); // Set loading state to true
      const redirectUrl = await createCheckoutSession(priceId); // Create a checkout session
      window.location.href = redirectUrl; // Redirect to the Stripe checkout page
    } catch (error) {
      console.error(error); // Log any errors
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.", // Show error toast
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        // Prevent closing the modal while loading
        if (!loading) {
          setOpen(open);
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resynox AI Premium</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p>Get a premium subscription to unlock more features.</p>
          <div className="flex">
            {/* Premium Plan Section */}
            <div className="flex w-1/2 flex-col space-y-5">
              <h3 className="text-center text-lg font-bold">Premium</h3>
              <ul className="list-inside space-y-2">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() =>
                  handlePremiumClick(
                    env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY, // Use the Premium plan price ID
                  )
                }
                disabled={loading}
              >
                Get Premium
              </Button>
            </div>
            <div className="mx-6 border-l" />
            {/* Premium Plus Plan Section */}
            <div className="flex w-1/2 flex-col space-y-5">
              <h3 className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-center text-lg font-bold text-transparent">
                Premium Plus
              </h3>
              <ul className="list-inside space-y-2">
                {premiumPlusFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="premium"
                onClick={() =>
                  handlePremiumClick(
                    env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY, // Use the Premium Plus plan price ID
                  )
                }
                disabled={loading}
              >
                Get Premium Plus
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}