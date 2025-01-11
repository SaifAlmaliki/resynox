import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { EditorFormProps } from "@/lib/types";
import { coverLetterSchema, CoverLetterValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WandSparklesIcon } from "lucide-react";
import { useSubscriptionLevel } from "../../SubscriptionLevelProvider";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseAITools } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import LoadingButton from "@/components/LoadingButton";
import { generateCoverLetter } from "./actions";

export default function CoverLetterForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const form = useForm<CoverLetterValues>({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      jobDescription: "",
      coverLetter: resumeData.coverLetter || "",
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({ ...resumeData, ...values });
    });

    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  // Get the current subscription level (determines if AI tools can be used)
  const subscriptionLevel = useSubscriptionLevel();

  // Hook for controlling the premium modal, shown if user doesn't have AI access
  const premiumModal = usePremiumModal();

  // Track whether the input dialog is visible
  const [showInputDialog, setShowInputDialog] = useState(false);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Cover Letter</h2>
        <p className="text-sm text-muted-foreground">
          Let AI generate a personalized cover letter based on your resume and job description
        </p>
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            // If user cannot use AI tools, show premium modal and return early
            if (!canUseAITools(subscriptionLevel)) {
              premiumModal.setOpen(true);
              return;
            }
            // Otherwise, show the dialog to input job description
            setShowInputDialog(true);
          }}
        >
          <WandSparklesIcon className="size-4 mr-2" />
          Generate Cover Letter (AI)
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-3">
          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Letter</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Your cover letter will appear here..."
                    className="min-h-[300px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* The input dialog for the user to provide a job description */}
      <InputDialog
        open={showInputDialog}
        onOpenChange={setShowInputDialog}
        onCoverLetterGenerated={(coverLetter) => {
          form.setValue("coverLetter", coverLetter);
          setShowInputDialog(false);
        }}
      />
    </div>
  );
}

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCoverLetterGenerated: (coverLetter: string) => void;
}

/**
 * The dialog component that appears when the user wants to generate a cover letter.
 * It contains a form where the user enters the job description. On submission, the AI-generated
 * cover letter is returned and processed.
 */
function InputDialog({ open, onOpenChange, onCoverLetterGenerated }: InputDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Set up a form with react-hook-form and zod validation
  const form = useForm<CoverLetterValues>({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      jobDescription: "",
      coverLetter: "",
    },
  });

  async function onSubmit(values: CoverLetterValues) {
    try {
      setLoading(true);
      const coverLetter = await generateCoverLetter(values);
      onCoverLetterGenerated(coverLetter);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Cover Letter</DialogTitle>
          <DialogDescription>
            Enter the job description and we&apos;ll generate a personalized cover letter based on your resume.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Paste the job description here..."
                      className="min-h-[200px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton loading={loading} type="submit">
              Generate
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
