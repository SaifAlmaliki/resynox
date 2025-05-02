import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUserIcon, PenLineIcon, ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { steps } from "./steps";

interface FooterProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  showSmResumePreview: boolean;
  setShowSmResumePreview: (show: boolean) => void;
  isSaving: boolean;
}

export default function Footer({ currentStep, setCurrentStep, showSmResumePreview, setShowSmResumePreview, isSaving}: FooterProps) {
  const previousStep = steps.find(
    (_, index) => steps[index + 1]?.key === currentStep,
  )?.key;

  const nextStep = steps.find(
    (_, index) => steps[index - 1]?.key === currentStep,
  )?.key;

  return (
    <footer className="w-full border-t px-3 py-5">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3">
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

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSmResumePreview(!showSmResumePreview)}
          title={
            showSmResumePreview ? "Show input form" : "Show resume preview"
          }
        >
          {showSmResumePreview ? <PenLineIcon /> : <FileUserIcon />}
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="secondary" asChild className="flex items-center gap-2">
            <Link href="/resumes">
              <CheckCircleIcon className="h-4 w-4" />
              Done
            </Link>
          </Button>
          <p
            className={cn(
              "text-muted-foreground opacity-0",
              isSaving && "opacity-100",
            )}
          >
            Saving...
          </p>
        </div>
      </div>
    </footer>
  );
}
