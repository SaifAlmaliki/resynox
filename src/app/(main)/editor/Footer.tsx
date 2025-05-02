// Import necessary components and utilities
import { Button } from "@/components/ui/button"; // UI Button component
import { cn } from "@/lib/utils"; // Utility function for conditional class names
import { FileUserIcon, PenLineIcon, ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from "lucide-react";
import Link from "next/link"; // Next.js Link component for navigation
import { steps } from "./steps"; // Steps configuration array

// Define the props expected by the Footer component
interface FooterProps {
  currentStep: string;                    // The key of the current step
  setCurrentStep: (step: string) => void; // Function to update the current step
  showSmResumePreview: boolean;           // Boolean to toggle small resume preview visibility
  setShowSmResumePreview: (show: boolean) => void; // Function to toggle resume preview visibility
  isSaving: boolean; // Boolean indicating if saving is in progress
}

// Footer component definition
export default function Footer({ currentStep, setCurrentStep, showSmResumePreview, setShowSmResumePreview, isSaving}: FooterProps) {
  // Determine the key of the previous step by finding the step before the current one
  const previousStep = steps.find(
    (_, index) => steps[index + 1]?.key === currentStep, // Check if the next step matches the current step
  )?.key;

  // Determine the key of the next step by finding the step after the current one
  const nextStep = steps.find(
    (_, index) => steps[index - 1]?.key === currentStep, // Check if the previous step matches the current step
  )?.key;

  return (
    <footer className="w-full border-t px-3 py-5">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3">
        {/* Navigation buttons for "Previous" and "Next" steps */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={previousStep ? () => setCurrentStep(previousStep) : undefined }
            disabled={!previousStep}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Previous step
          </Button>

          <Button 
            onClick={nextStep ? () => setCurrentStep(nextStep) : undefined }
            disabled={!nextStep}
            className="flex items-center gap-2"
          >
            Next step
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Toggle button for small resume preview, hidden on larger screens */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSmResumePreview(!showSmResumePreview)} // Toggle preview visibility
          className="md:hidden" // Hidden on medium and larger screens
          title={
            showSmResumePreview ? "Show input form" : "Show resume preview" // Tooltip text
          }
        >
          {/* Toggle between icons based on preview visibility */}
          {showSmResumePreview ? <PenLineIcon /> : <FileUserIcon />}
        </Button>

        {/* Action buttons for closing and status display */}
        <div className="flex items-center gap-3">
          {/* Link to close the form and navigate back to the resumes list */}
          <Button variant="secondary" asChild className="flex items-center gap-2">
            <Link href="/resumes">
              <CheckCircleIcon className="h-4 w-4" />
              Done
            </Link>
          </Button>
          {/* Display saving status with conditional opacity */}
          <p
            className={cn(
              "text-muted-foreground opacity-0", // Default invisible text
              isSaving && "opacity-100",         // Make visible if saving
            )}
          >
            Saving...
          </p>
        </div>
      </div>
    </footer>
  );
}
