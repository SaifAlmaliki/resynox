"use client";

// Import necessary dependencies and components
import useUnloadWarning from "@/hooks/useUnloadWarning"; // Hook to warn users about unsaved changes
import { ResumeServerData } from "@/lib/types"; // Type for resume server data
import { cn, mapToResumeValues } from "@/lib/utils"; // Utility functions for class names and mapping data
import { ResumeValues } from "@/lib/validation"; // Validation schema for resume data
import { useSearchParams } from "next/navigation"; // Hook for managing search params in Next.js
import { useState } from "react"; // React state management
import Breadcrumbs from "./Breadcrumbs"; // Breadcrumb navigation component
import Footer from "./Footer"; // Footer component for navigation and controls
import ResumePreviewSection from "./ResumePreviewSection"; // Resume preview component
import { steps } from "./steps"; // Step configuration for the form
import useAutoSaveResume from "./useAutoSaveResume"; // Hook for auto-saving resume data

// Interface for the props of the ResumeEditor component
interface ResumeEditorProps {
  resumeToEdit: ResumeServerData | null; // Resume data to edit, or null if creating a new one
}

// Main component for the resume editor
export default function ResumeEditor({ resumeToEdit }: ResumeEditorProps) {
  // Fetch search params for navigation between steps
  const searchParams = useSearchParams();

  // State for managing the resume data; initialize with mapped data or an empty object
  const [resumeData, setResumeData] = useState<ResumeValues>(
    resumeToEdit ? mapToResumeValues(resumeToEdit) : {}
  );

  // State for toggling the small resume preview visibility
  const [showSmResumePreview, setShowSmResumePreview] = useState(false);

  // Auto-save functionality and tracking unsaved changes
  const { isSaving, hasUnsavedChanges } = useAutoSaveResume(resumeData);

  // Warn users if they attempt to leave the page with unsaved changes
  useUnloadWarning(hasUnsavedChanges);

  // Determine the current step based on search params or default to the first step
  const currentStep = searchParams.get("step") || steps[0].key;

  // Function to update the step in the URL query parameters
  function setStep(key: string) {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("step", key);
    window.history.pushState(null, "", `?${newSearchParams.toString()}`);
  }

  // Find the component associated with the current step
  const FormComponent = steps.find((step) => step.key === currentStep)?.component;

  return (
    <div className="flex grow flex-col"> {/* Container for the editor */}
      {/* Header section with a title and description */}
      <header className="space-y-1.5 border-b px-3 py-5 text-center">
        <h1 className="text-2xl font-bold">Design your resume</h1>
        <p className="text-sm text-muted-foreground">
          Follow the steps below to create your resume. Your progress will be saved automatically.
        </p>
      </header>

      {/* Main content area */}
      <main className="relative grow">
        <div className="absolute bottom-0 top-0 flex w-full">
          {/* Left panel: Breadcrumbs and form */}
          <div
            className={cn(
              "w-full space-y-6 overflow-y-auto p-3 md:block md:w-1/2",
              showSmResumePreview && "hidden" // Hide panel on smaller screens when preview is visible
            )}
          >
            {/* Breadcrumb navigation */}
            <Breadcrumbs currentStep={currentStep} setCurrentStep={setStep} />

            {/* Render the current form component, if available */}
            {FormComponent && (
              <FormComponent
                resumeData={resumeData} // Pass resume data to the form
                setResumeData={setResumeData} // Allow the form to update resume data
              />
            )}
          </div>

          {/* Spacer between the form and preview */}
          <div className="grow md:border-r" />

          {/* Right panel: Resume preview */}
          <ResumePreviewSection
            resumeData={resumeData} // Pass resume data to the preview
            setResumeData={setResumeData} // Allow updating resume data from the preview
            className={cn(showSmResumePreview && "flex")} // Adjust styles based on preview visibility
          />
        </div>
      </main>

      {/* Footer with navigation controls */}
      <Footer
        currentStep={currentStep} // Current step for navigation
        setCurrentStep={setStep} // Function to update the step
        showSmResumePreview={showSmResumePreview} // Toggle preview visibility
        setShowSmResumePreview={setShowSmResumePreview} // Setter for preview visibility
        isSaving={isSaving} // Indicate whether data is being saved
      />
    </div>
  );
}
