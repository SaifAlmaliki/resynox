"use client";

import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";

/**
 * GetSubscriptionButton Component
 * A button that opens a modal to initiate the premium subscription process.
 *
 * @returns JSX.Element - The rendered button component.
 */
export default function GetSubscriptionButton() {
  // Use the custom hook to manage the premium modal state
  const premiumModal = usePremiumModal();

  // Render the button with an onClick event to open the premium modal
  return (
    <Button onClick={() => premiumModal.setOpen(true)} variant="premium">
      Get Premium subscription
    </Button>
  );
}
