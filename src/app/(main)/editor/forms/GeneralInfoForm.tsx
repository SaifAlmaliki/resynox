import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { Input } from "@/components/ui/input"; // Import Input component
import { EditorFormProps } from "@/lib/types"; // Type for form props
import { generalInfoSchema, GeneralInfoValues } from "@/lib/validation"; // Validation schema and type
import { zodResolver } from "@hookform/resolvers/zod"; // Resolver for Zod validation
import { useEffect } from "react"; // React hook for side effects
import { useForm } from "react-hook-form"; // Hook for managing form state

// Component for editing general information
// resumeData: Resume data to populate the form
// setResumeData: Callback to update resume data

export default function GeneralInfoForm({resumeData, setResumeData}: EditorFormProps) {
  // Initialize the form with validation and default values
  const form = useForm<GeneralInfoValues>({
    resolver: zodResolver(generalInfoSchema), // Apply Zod validation schema
    defaultValues: {
      title: resumeData.title || "", // Default title or empty string
      description: resumeData.description || "", // Default description or empty string
    },
  });

  // Effect to watch form values and update resume data when the form is valid
  useEffect(() => {
    // Subscribe to form value changes
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger(); // Validate form values
      if (!isValid) return; // Do not update data if validation fails
      setResumeData({ ...resumeData, ...values });
    });

    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">General info</h2>
        <p className="text-sm text-muted-foreground">
          This will not appear on your resume.
        </p>
      </div>

      {/* Main Form */}
      <Form {...form}>
        <form className="space-y-3">
          {/* Field for project title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="My cool resume" autoFocus />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Field for project description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="A resume for my next job" />
                </FormControl>
                <FormDescription>Describe what this resume is for.</FormDescription>
                <FormMessage /> {/* Display validation error message */}
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
