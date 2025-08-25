import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseAITools } from "@/lib/permissions";
import { ResumeValues } from "@/lib/validation";
import { WandSparklesIcon } from "lucide-react";
import { useState } from "react";
import { useSubscriptionLevel } from "../../SubscriptionLevelProvider";
import { generateSummary } from "./actions";

interface GenerateSummaryButtonProps {
  resumeData: ResumeValues;                       // The current resume data
  onSummaryGenerated: (summary: string) => void;  // Callback when summary is generated
}

/**
 * This component renders a button that, when clicked, attempts to generate a summary
 * of the user's resume data using AI. It checks user permissions based on subscription level,
 * potentially opens a premium modal if required, and shows loading and error states as needed.
 */
export default function GenerateSummaryButton({
  resumeData,
  onSummaryGenerated,
}: GenerateSummaryButtonProps) {

  // Get user's current subscription level from context
  const subscriptionLevel = useSubscriptionLevel();

  // Hook to control the premium modal (displayed if user lacks access)
  const premiumModal = usePremiumModal();

  // Hook for toasting notifications
  const { toast } = useToast();

  // Local state to track loading status for generating summary
  const [loading, setLoading] = useState(false);

  // Handler for the click event. It checks permissions, shows modal if needed,
  // and tries to generate a summary using the `generateSummary` function.
  async function handleClick() {
    // If user can't use AI tools at their subscription level, show premium modal
    if (!canUseAITools(subscriptionLevel)) {
      premiumModal.setOpen(true);
      return;
    }

    try {
      setLoading(true);

      // Call backend logic (e.g., an API) to generate the summary
      const aiResponse = await generateSummary(resumeData);

      // If successful, call the callback with the generated summary
      onSummaryGenerated(aiResponse);
    }
    catch (error) {
      console.error(error);

      // Show an error toast if something goes wrong
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      // Ensure loading state is cleared after operation completes
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <LoadingButton
        variant="outline"
        type="button"
        onClick={handleClick}
        loading={loading}
      >
        {/*WandSparklesIcon is a decorative icon representing magic/AI generation.*/}
        <WandSparklesIcon className="size-4" />
        Generate (AI)
      </LoadingButton>
      <p className="text-xs text-muted-foreground">
        Cost: 4 points
      </p>
    </div>
  );
}
