import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseAITools } from "@/lib/permissions";
import {
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  WorkExperience,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { WandSparklesIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSubscriptionLevel } from "../../SubscriptionLevelProvider";
import { generateWorkExperience } from "./actions";

interface GenerateWorkExperienceButtonProps {
  onWorkExperienceGenerated: (workExperience: WorkExperience) => void;
}

/**
 * This button, when clicked, checks the user's subscription level. If they have
 * access to AI tools, it opens a dialog prompting the user to describe a work experience.
 * The AI then generates an optimized work experience entry from that description.
 */
export default function GenerateWorkExperienceButton({ onWorkExperienceGenerated }: GenerateWorkExperienceButtonProps) {
  // Get the current subscription level (determines if AI tools can be used)
  const subscriptionLevel = useSubscriptionLevel();

  // Hook for controlling the premium modal, shown if user doesn't have AI access
  const premiumModal = usePremiumModal();

  // Track whether the input dialog is visible
  const [showInputDialog, setShowInputDialog] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center space-y-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            // If user cannot use AI tools, show premium modal and return early
            if (!canUseAITools(subscriptionLevel)) {
              premiumModal.setOpen(true);
              return;
            }
            // Otherwise, show the dialog to input work experience description
            setShowInputDialog(true);
          }}
        >
          <WandSparklesIcon className="size-4" />
          Smart fill (AI)
        </Button>
        <p className="text-xs text-muted-foreground">
          Cost: 2 points
        </p>
      </div>

      {/* The input dialog for the user to provide a description, which will be used to generate the work experience */}
      <InputDialog
        open={showInputDialog}
        onOpenChange={setShowInputDialog}
        onWorkExperienceGenerated={(workExperience) => {
          // Once generated, call the callback and close the dialog
          onWorkExperienceGenerated(workExperience);
          setShowInputDialog(false);
        }}
      />
    </>
  );
}

interface InputDialogProps {
  open: boolean;                                        // Controls dialog visibility
  onOpenChange: (open: boolean) => void;                // Callback to handle dialog open state changes
  onWorkExperienceGenerated: (workExperience: WorkExperience) => void; // Callback to handle generated work experience
}

/**
 * The dialog component that appears when the user wants to generate a work experience.
 * It contains a form where the user describes their experience. On submission, the AI-generated
 * experience is returned and processed.
 */
function InputDialog({ open, onOpenChange, onWorkExperienceGenerated }: InputDialogProps) {
  const { toast } = useToast();

  // Set up a form with react-hook-form and zod validation
  const form = useForm<GenerateWorkExperienceInput>({
    resolver: zodResolver(generateWorkExperienceSchema),
    defaultValues: {
      description: "",
    },
  });

  // Handle form submission: calls the backend function to generate the work experience
  async function onSubmit(input: GenerateWorkExperienceInput) {
    try {
      const response = await generateWorkExperience(input);
      onWorkExperienceGenerated(response);
    } catch (error) {
      console.error(error);
      // Show an error notification if something goes wrong
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate work experience</DialogTitle>
          <DialogDescription>
            Describe this work experience and the AI will generate an optimized entry for you.
          </DialogDescription>
        </DialogHeader>

        {/* Form structure using the provided UI components and react-hook-form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Field for the user to input the raw description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`E.g. "From Nov 2019 to Dec 2020 I worked at Google as a software engineer. My tasks included: ..."`}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Submit button with loading state */}
            <LoadingButton type="submit" loading={form.formState.isSubmitting}>
              Generate
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
