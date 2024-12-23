// Importing necessary components and hooks from the project and external libraries.
import { Button } from "@/components/ui/button"; // Button UI component.
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Form-related components for structured and styled forms.
import { Input } from "@/components/ui/input"; // Input field UI component.
import { EditorFormProps } from "@/lib/types"; // Type definitions for form props.
import { personalInfoSchema, PersonalInfoValues } from "@/lib/validation"; // Validation schema and type definitions for form data.
import { zodResolver } from "@hookform/resolvers/zod"; // Zod resolver for integrating validation schema with React Hook Form.
import { useEffect, useRef } from "react"; // React hooks for lifecycle management and references.
import { useForm } from "react-hook-form"; // React Hook Form library for form state management.

export default function PersonalInfoForm({resumeData, setResumeData}: EditorFormProps) {
  // Initialize the form using `useForm` hook with validation schema and default values.
  const form = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema), // Integrates Zod schema for validation.
    defaultValues: {
      // Set default values from `resumeData` or fallback to empty strings.
      firstName: resumeData.firstName || "",
      lastName: resumeData.lastName || "",
      jobTitle: resumeData.jobTitle || "",
      city: resumeData.city || "",
      country: resumeData.country || "",
      phone: resumeData.phone || "",
      email: resumeData.email || "",
    },
  });

  // Synchronize form state with `resumeData` using `useEffect`.
  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger(); // Validates the form fields.
      if (!isValid) return; // If form validation fails, exit early.

      // Merge `resumeData` with updated form values (`values`) and update the state.
      setResumeData({ ...resumeData, ...values });
    });

    return unsubscribe; // Cleanup form watcher when component unmounts.
  }, [form, resumeData, setResumeData]); // Dependencies to trigger this effect.

  // Reference for the photo input field.
  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Form header section with a title and description */}
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Personal info</h2>
        <p className="text-sm text-muted-foreground">Tell us about yourself.</p>
      </div>
      {/* Form component initialized with `form` */}
      <Form {...form}>
        <form className="space-y-3">
          {/* Photo input field */}
          <FormField
            control={form.control} // Connects the field to form control.
            name="photo" // Field name.
            render={({ field: { value, ...fieldValues } }) => (
              <FormItem>
                <FormLabel>Your photo</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      {...fieldValues} // Pass form field props.
                      type="file"      // Input type for file upload.
                      accept="image/*" // Accept only image files.
                      onChange={(e) => {
                        const file = e.target.files?.[0]; // Get the selected file.
                        fieldValues.onChange(file);       // Update field value.
                      }}
                      ref={photoInputRef} // Attach input field to the reference.
                    />
                  </FormControl>
                  {/* Button to clear the photo input */}
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      fieldValues.onChange(null); // Clear the form value.
                      if (photoInputRef.current) {
                        photoInputRef.current.value = ""; // Reset the input field.
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <FormMessage /> {/* Displays validation error messages. */}
              </FormItem>
            )}
          />

          {/* First and Last Name fields in a two-column grid */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} /> {/* First name input field */}
                  </FormControl>
                  <FormMessage /> {/* Error messages */}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} /> {/* Last name input field */}
                  </FormControl>
                  <FormMessage /> {/* Error messages */}
                </FormItem>
              )}
            />
          </div>

          {/* Job Title field */}
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job title</FormLabel>
                <FormControl>
                  <Input {...field} /> {/* Job title input field */}
                </FormControl>
                <FormMessage /> {/* Error messages */}
              </FormItem>
            )}
          />

          {/* City and Country fields in a two-column grid */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} /> {/* City input field */}
                  </FormControl>
                  <FormMessage /> {/* Error messages */}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} /> {/* Country input field */}
                  </FormControl>
                  <FormMessage /> {/* Error messages */}
                </FormItem>
              )}
            />
          </div>

          {/* Phone field */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" /> {/* Phone input field */}
                </FormControl>
                <FormMessage /> {/* Error messages */}
              </FormItem>
            )}
          />
          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" /> {/* Email input field */}
                </FormControl>
                <FormMessage /> {/* Error messages */}
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
