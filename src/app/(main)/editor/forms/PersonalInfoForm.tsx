// Importing necessary components and hooks from the project and external libraries.
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageIcon, UploadIcon, Trash2 } from "lucide-react";
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
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <div>
                        <Input
                          {...fieldValues}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            fieldValues.onChange(file);
                          }}
                          ref={photoInputRef}
                          className="hidden"
                          id="photo-upload"
                        />
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 border-2 h-11 px-4 bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900"
                            onClick={() => photoInputRef.current?.click()}
                          >
                            <UploadIcon className="h-4 w-4" />
                            <span>{value ? 'Change Photo' : 'Choose File'}</span>
                          </Button>
                          <Button
                            variant="secondary"
                            type="button"
                            className="h-11"
                            onClick={() => {
                              fieldValues.onChange(null);
                              if (photoInputRef.current) {
                                photoInputRef.current.value = "";
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                  </div>
                  {value && (
                    <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 pl-1">
                      <ImageIcon className="h-3 w-3" />
                      {value instanceof File ? value.name : 'Photo selected'}
                    </div>
                  )}
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
