"use client";

import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { PlusSquare } from "lucide-react";
import Link from "next/link";

// Interface for the props accepted by CreateResumeButton component
interface CreateResumeButtonProps {
  canCreate: boolean; // Indicates whether the user can create a new resume
}

// Functional component: CreateResumeButton
export default function CreateResumeButton({canCreate }: CreateResumeButtonProps) {
  // Hook to control the premium modal's visibility
  const premiumModal = usePremiumModal();

  // If the user can create a new resume, render the button that links to the editor
  if (canCreate) {
    return (
      <Button asChild className="mx-auto flex w-fit gap-2">
        {/* Link to the resume editor */}
        <Link href="/editor">
          <PlusSquare className="size-5" /> {/* Plus icon */}
          <span>New resume</span>
        </Link>
      </Button>
    );
  }

  // If the user cannot create a resume, trigger the premium modal on click
  return (
    <Button
      onClick={() => premiumModal.setOpen(true)} // Open the premium modal
      className="mx-auto flex w-fit gap-2"
    >
      <PlusSquare className="size-5" /> {/* Plus icon */}
      <span>New resume</span>
    </Button>
  );
}
