"use client";

import { env } from "@/env"; // Environment variables
import { useToast } from "@/hooks/use-toast"; // Hook for toast notifications
import usePremiumModal from "@/hooks/usePremiumModal"; // Custom hook to manage modal state
import { Check } from "lucide-react"; // Icon component for checkmarks
import { useState } from "react"; // React state management
import { Button } from "../ui/button"; // Button UI component
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"; // Dialog UI components
import { createCheckoutSession } from "./actions"; // Function to create a Stripe checkout session

// Features available in different premium plans
const premiumFeatures = ["AI tools", "Up to 3 resumes"];
const premiumPlusFeatures = ["Infinite resumes", "Design customizations"];

/**
 * PremiumModal Component:
 * A modal that allows users to purchase premium subscriptions.
 * It displays the features for two plans: Premium and Premium Plus.
 */
export default function PremiumModal() {
  const { open, setOpen } = usePremiumModal();    // Manage modal state (open/close)
  const { toast } = useToast();                   // Toast notifications for errors
  const [loading, setLoading] = useState(false);  // Loading state for checkout actions

  /**
   * Handles the click event for purchasing premium subscriptions.
   * Redirects users to the Stripe checkout page.
   * @param priceId - Stripe price ID for the selected plan
   */
  async function handlePremiumClick(priceId: string) {
    try {
      setLoading(true); // Set loading state
      const redirectUrl = await createCheckoutSession(priceId); // Initiate checkout session
      window.location.href = redirectUrl; // Redirect to Stripe's checkout page
    } catch (error) {
      console.error(error);
      // Show error message if the checkout fails
      toast({
        variant: "destructive",
        description: "Something went wrong in the checkout. Please try again.",
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newState) => {
        if (!loading) setOpen(newState); // Prevent closing while loading
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resume Builder AI Premium</DialogTitle>
        </DialogHeader>

        {/* Modal Content */}
        <div className="space-y-6">
          <p>Get a premium subscription to unlock more features.</p>
          <div className="flex">
            {/* Premium Plan Section */}
            <PremiumPlanCard
              title="Premium"
              features={premiumFeatures}
              buttonText="Get Premium"
              loading={loading}
              onClick={() =>
                handlePremiumClick(env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY)
              }
            />

            {/* Vertical Divider */}
            <div className="mx-6 border-l" />

            {/* Premium Plus Plan Section */}
            <PremiumPlanCard
              title="Premium Plus"
              features={premiumPlusFeatures}
              buttonText="Get Premium Plus"
              loading={loading}
              variant="premium"
              onClick={() =>
                handlePremiumClick(env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY)
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * PremiumPlanCard Component:
 * Displays a single subscription plan with its title, features, and purchase button.
 */
function PremiumPlanCard({ title, features, buttonText, loading, onClick, variant = "default"}:{
  title: string;
  features: string[];
  buttonText: string;
  loading: boolean;
  onClick: () => void;
  variant?: "default" | "premium";
}) {
  return (
    <div className="flex w-1/2 flex-col space-y-5">
      {/* Plan Title */}
      <h3
        className={`text-center text-lg font-bold ${
          variant === "premium"
            ? "bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent"
            : ""
        }`}
      >
        {title}
      </h3>

      {/* Feature List */}
      <ul className="list-inside space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="size-4 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Call-to-Action Button */}
      <Button variant={variant} onClick={onClick} disabled={loading}>
        {buttonText}
      </Button>
    </div>
  );
}