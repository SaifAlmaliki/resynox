// Summary:
// This file defines the `ManageSubscriptionButton` component, which provides users with a button to manage their subscriptions.
// When clicked, it redirects users to the Stripe Customer Portal where they can view or modify their subscription.
// The component handles loading states and error notifications using a custom toast hook.

"use client"; // Marks this file as a client component in Next.js, meaning it will run on the client side.

import LoadingButton from "@/components/LoadingButton"; // Custom button component with a loading indicator.
import { useToast } from "@/hooks/use-toast"; // Custom hook for displaying toast notifications.
import { useState } from "react"; // React hook for managing component state.
import { createCustomerPortalSession } from "./actions"; // API action to create a Stripe Customer Portal session.

/**
 * ManageSubscriptionButton Component
 * Provides a button for users to manage their subscriptions via the Stripe Customer Portal.
 *
 * @returns JSX.Element - The rendered button component.
 */
export default function ManageSubscriptionButton() {
  const { toast } = useToast(); // Hook to trigger toast notifications.

  const [loading, setLoading] = useState(false); // State to track the loading status of the button.

  // Handler for button click
  async function handleClick() {
    try {
      setLoading(true); // Set loading state to true while processing.
      const redirectUrl = await createCustomerPortalSession(); // Fetch the URL for the Stripe Customer Portal.
      window.location.href = redirectUrl; // Redirect the user to the portal.
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive", // Display an error notification.
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
