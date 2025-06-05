"use client";

import { env } from "@/env";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { createCheckoutSession } from "./actions";

// Pro plan features
const proFeatures = [
  "AI Personalized Cover Letter",
  "AI Professional career summaries",
  "Unlimited resumes",
  "Advanced design customizations",
  "All AI features included"
];

// Pro Plus plan features
const proPlusFeatures = [
  "AI Personalized Cover Letter",
  "AI Professional career summaries", 
  "Unlimited resumes",
  "Advanced design customizations",
  "All AI features included",
  "Voice Agent Mock Interviews",
  "AI Interview Feedback & Analysis"
];

export default function PremiumModal() {
  const { open, setOpen } = usePremiumModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handlePremiumClick(priceId: string) {
    try {
      setLoading(true);
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
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!loading) {
          setOpen(open);
        }
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Resynox AI Premium Plans</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p>Choose the plan that best fits your needs.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pro Plan */}
            <div className="flex flex-col space-y-5 border rounded-lg p-6">
              <h3 className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-center text-lg font-bold text-transparent">
                Pro
              </h3>
              <ul className="list-inside space-y-2 flex-grow">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 text-blue-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                onClick={() =>
                  handlePremiumClick(
                    env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
                  )
                }
                disabled={loading}
              >
                Get Pro
              </Button>
            </div>

            {/* Pro Plus Plan */}
            <div className="flex flex-col space-y-5 border-2 border-green-500 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 text-sm font-semibold rounded-full">
                  RECOMMENDED
                </span>
              </div>
              <h3 className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-center text-lg font-bold text-transparent">
                Pro Plus
              </h3>
              <ul className="list-inside space-y-2 flex-grow">
                {proPlusFeatures.map((feature) => (
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
                    env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY,
                  )
                }
                disabled={loading}
              >
                Get Pro Plus
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}