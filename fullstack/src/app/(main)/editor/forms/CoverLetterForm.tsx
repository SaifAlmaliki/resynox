import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { EditorFormProps } from "@/lib/types";
import { coverLetterSchema, CoverLetterValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import GenerateCoverLetterButton from "./GenerateCoverLetterButton";

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

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Cover Letter</h2>
        <p className="text-sm text-muted-foreground">
          Enter the job description and let AI generate a personalized cover letter based on your resume
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-3">
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
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <GenerateCoverLetterButton
                  resumeData={resumeData}
                  onCoverLetterGenerated={(coverLetter) =>
                    form.setValue("coverLetter", coverLetter)
                  }
                />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
