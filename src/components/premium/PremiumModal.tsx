"use client";

import { env } from "@/env";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { Sparkles, Tag } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { createCheckoutSession } from "./actions";

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
          <DialogTitle>Unlock AI with Points</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Choose a plan to receive monthly points. Points roll over and can be used for AI actions.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pro Plan */}
            <div className="flex flex-col gap-4 border rounded-lg p-6 bg-card/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pro</h3>
                <Tag className="size-4 text-blue-600" />
              </div>
              <div className="text-sm text-muted-foreground">$3.99 / month</div>
              <div className="text-2xl font-bold">40 points / month</div>
              <Button
                variant="outline"
                onClick={() => handlePremiumClick(env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY)}
                disabled={loading}
              >
                Get Pro
              </Button>
            </div>

            {/* Pro Plus Plan */}
            <div className="flex flex-col gap-4 border-2 border-green-500 rounded-lg p-6 bg-card/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 text-sm font-semibold rounded-full">RECOMMENDED</span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pro Plus</h3>
                <Tag className="size-4 text-green-600" />
              </div>
              <div className="text-sm text-muted-foreground">$7.99 / month</div>
              <div className="text-2xl font-bold">80 points / month</div>
              <Button
                variant="premium"
                onClick={() => handlePremiumClick(env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY)}
                disabled={loading}
              >
                Get Pro Plus
              </Button>
            </div>
          </div>

          {/* Points costs */}
          <div className="mt-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4 text-yellow-600" />
              <p className="font-medium">Points cost for AI actions</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-sm text-muted-foreground">
              <li>Cover letter generation — 5 points</li>
              <li>Resume summary — 4 points</li>
              <li>Enhance work experience — 2 points</li>
              <li>Start voice interview session — 10 points</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}