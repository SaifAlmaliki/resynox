"use client";

import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { createCustomerPortalSession } from "./actions";

// Button for users to manage their Stripe subscription
export default function ManageSubscriptionButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);


  async function handleClick() {
    try {
      setLoading(true);
      const redirectUrl = await createCustomerPortalSession();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false); // Reset the loading state.
    }
  }

  // Render the button with loading indicator and click handler
  return (
    <LoadingButton onClick={handleClick} loading={loading}>
      Manage subscription
    </LoadingButton>
  );
}
