// Import necessary components, hooks, and utilities
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // UI components for consistent form styling
import { Textarea } from "@/components/ui/textarea"; // Textarea component for user input
import { EditorFormProps } from "@/lib/types"; // Type definitions for props
import { summarySchema, SummaryValues } from "@/lib/validation"; // Zod schema for validation and type definitions
import { zodResolver } from "@hookform/resolvers/zod"; // Zod integration with React Hook Form
import { useEffect } from "react"; // Hook to manage side effects
import { useForm } from "react-hook-form"; // React Hook Form for state management
import GenerateSummaryButton from "./GenerateSummaryButton"; // Button for AI-generated summary

// Define and export the SummaryForm component
export default function SummaryForm({
  resumeData,     // Current resume data passed as a prop
  setResumeData,  // Function to update the resume data
}: EditorFormProps) {
  // Initialize the form with useForm hook
  const form = useForm<SummaryValues>({
    resolver: zodResolver(summarySchema), // Attach Zod schema for validation
    defaultValues: {
      summary: resumeData.summary || "",  // Set initial value for summary field
    },
  });

  // Effect to watch for changes in the form values
  useEffect(() => {
    // Watch form values and validate them
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger(); // Validate the form
      if (!isValid) return; // Do nothing if the form is invalid
      setResumeData({ ...resumeData, ...values }); // Update resume data with new summary value
    });

    // Cleanup the watcher when component unmounts or dependencies change
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  // Render the component
  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header section */}
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Professional Summary</h2>
        <p className="text-sm text-muted-foreground">
          Write a short introduction for your resume or let the AI generate one
          from your entered data.
        </p>
      </div>

      {/* Main form */}
      <Form {...form}>
        <form className="space-y-3">
          {/* Form field for the summary */}
          <FormField
            control={form.control} // Connect the field to the form
            name="summary" // Field name used in the form
            render={({ field }) => (
              <FormItem>
                {/* Hidden label for accessibility */}
                <FormLabel className="sr-only">Professional Summary</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="A brief, engaging text about yourself" />
                </FormControl>
                {/* Validation message */}
                <FormMessage />
                {/* Button for generating a summary using AI */}
                <GenerateSummaryButton
                  resumeData={resumeData} // Pass current resume data
                  onSummaryGenerated={(summary) =>
                    form.setValue("summary", summary) // Update the summary field when AI generates text
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