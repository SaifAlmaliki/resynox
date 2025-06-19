"use client";

import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { PlusSquare } from "lucide-react";
import Link from "next/link";

// Interface for the props accepted by CreateCoverLetterButton component
interface CreateCoverLetterButtonProps {
  canCreate: boolean; // Indicates whether the user can create a new cover letter
}

// Functional component: CreateCoverLetterButton
export default function CreateCoverLetterButton({ canCreate }: CreateCoverLetterButtonProps) {
  // Hook to control the premium modal's visibility
  const premiumModal = usePremiumModal();

  // If the user can create a new cover letter, render the button that links to the new cover letter page
  if (canCreate) {
    return (
      <Button asChild className="mx-auto flex w-fit gap-2">
        {/* Link to the cover letter creation page */}
        <Link href="/cover-letters/new">
          <PlusSquare className="size-5" /> {/* Plus icon */}
          <span>New cover letter</span>
        </Link>
      </Button>
    );
  }

  // If the user cannot create a cover letter, trigger the premium modal on click
  return (
    <Button
      onClick={() => premiumModal.setOpen(true)} // Open the premium modal
      className="mx-auto flex w-fit gap-2"
    >
      <PlusSquare className="size-5" /> {/* Plus icon */}
      <span>New cover letter</span>
    </Button>
  );
} 