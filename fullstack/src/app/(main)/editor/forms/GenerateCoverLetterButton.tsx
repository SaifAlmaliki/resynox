import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseAITools } from "@/lib/permissions";
import { ResumeValues } from "@/lib/validation";
import { WandSparklesIcon } from "lucide-react";
import { useState } from "react";
import { useSubscriptionLevel } from "../../SubscriptionLevelProvider";
import { generateCoverLetter } from "./actions";

interface GenerateCoverLetterButtonProps {
  resumeData: ResumeValues;
  onCoverLetterGenerated: (coverLetter: string) => void;
}

export default function GenerateCoverLetterButton({
  resumeData,
  onCoverLetterGenerated,
}: GenerateCoverLetterButtonProps) {
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!canUseAITools(subscriptionLevel)) {
      premiumModal.setOpen(true);
      return;
    }

    if (!resumeData.jobDescription) {
      toast({
        variant: "destructive",
        description: "Please enter a job description first.",
      });
      return;
    }

    try {
      setLoading(true);
      const aiResponse = await generateCoverLetter(resumeData);
      onCoverLetterGenerated(aiResponse);
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
    <LoadingButton
      variant="outline"
      type="button"
      onClick={handleClick}
      loading={loading}
    >
      <WandSparklesIcon className="size-4" />
      Generate Cover Letter (AI)
    </LoadingButton>
  );
}
