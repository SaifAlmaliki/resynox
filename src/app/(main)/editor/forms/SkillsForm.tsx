import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"; // UI form components for consistent styling and behavior
import { Textarea } from "@/components/ui/textarea";  // Textarea component for input
import { EditorFormProps } from "@/lib/types";        // Custom type definitions for props
import { skillsSchema, SkillsValues } from "@/lib/validation"; // Zod schema for validation and type definitions
import { zodResolver } from "@hookform/resolvers/zod";         // Resolver to integrate Zod validation with React Hook Form
import { useEffect } from "react"; // React hook to handle side effects
import { useForm } from "react-hook-form"; // React Hook Form for form state management

// Define and export the SkillsForm component
export default function SkillsForm({
  resumeData, // The current resume data
  setResumeData, // Function to update the resume data
}: EditorFormProps) {
  // Initialize the form using the useForm hook
  const form = useForm<SkillsValues>({
    resolver: zodResolver(skillsSchema), // Zod resolver for validation
    defaultValues: {
      skills: resumeData.skills || [], // Default value for skills from resumeData
    },
  });

  // Watch the form's values and update resumeData whenever it changes
  useEffect(() => {
    // Watch for changes in the form values
    const { unsubscribe } = form.watch(async (values) => {
      // Trigger validation and only proceed if valid
      const isValid = await form.trigger();
      if (!isValid) return;

      // Update the resumeData with sanitized and trimmed skill values
      setResumeData({
        ...resumeData,
        skills:
          values.skills
            ?.filter((skill) => skill !== undefined) // Exclude undefined values
            .map((skill) => skill.trim()) // Remove extra spaces
            .filter((skill) => skill !== "") || [], // Exclude empty strings
      });
    });

    // Clean up the watcher when the component unmounts or dependencies change
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  // Render the form UI
  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header section */}
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Skills</h2>
        <p className="text-sm text-muted-foreground">
          What are you good at?
        </p>
      </div>

      {/* Main form */}
      <Form {...form}>
        <form className="space-y-3">
          {/* Form field for skills */}
          <FormField
            control={form.control} // Connect to the form control
            name="skills" // Field name to be used in form values
            render={({ field }) => (
              <FormItem>
                {/* Hidden label for accessibility */}
                <FormLabel className="sr-only">Skills</FormLabel>
                <FormControl>
                  {/* Textarea for skill input */}
                  <Textarea
                    {...field} // Connect the field to form state
                    placeholder="e.g. React.js, Node.js, graphic design, ..."
                    onChange={(e) => {
                      // Split input by commas and update the field
                      const skills = e.target.value.split(",");
                      field.onChange(skills);
                    }}
                  />
                </FormControl>
                {/* Instruction for the user */}
                <FormDescription>
                  Separate each skill with a comma.
                </FormDescription>
                {/* Validation error message */}
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
