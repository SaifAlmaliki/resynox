import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useDebounce from "@/hooks/useDebounce";
import { fileReplacer } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { saveResume } from "./actions";

/**
 * A custom hook that automatically saves the resume data to the server whenever it changes,
 * with a debounce to minimize unnecessary requests. It also updates the browser's URL
 * with the latest resume ID, handles errors, and provides a retry button in toast notifications.
 *
 * @param resumeData The current state of the resume data to be saved.
 * @returns An object containing:
 *   - isSaving: boolean indicating if a save is currently in progress
 *   - hasUnsavedChanges: boolean indicating if there are changes not yet saved to the server
 */
export default function useAutoSaveResume(resumeData: ResumeValues) {
  // Get query parameters from the URL (specifically "resumeId")
  const searchParams = useSearchParams();

  // Set up toast notifications for feedback (errors, retries, etc.)
  const { toast } = useToast();

  // Debounce resume data changes by 1.5 seconds to avoid frequent saves on every small change
  const debouncedResumeData = useDebounce(resumeData, 1500);

  // Maintain a local state of the current resume ID.
  // Initially comes from resumeData, but may update after saving.
  const [resumeId, setResumeId] = useState(resumeData.id);

  // Keep track of the last successfully saved data.
  // Used for determining if there are unsaved changes.
  const [lastSavedData, setLastSavedData] = useState(structuredClone(resumeData));

  // Track saving state to prevent concurrent saves
  const [isSaving, setIsSaving] = useState(false);

  // Track if an error occurred during the last save attempt
  const [isError, setIsError] = useState(false);

  // Reset the error state whenever the debounced data changes
  useEffect(() => {
    setIsError(false);
  }, [debouncedResumeData]);

  useEffect(() => {
    /**
     * Perform the save operation. It:
     * - Updates the server with the current `debouncedResumeData`.
     * - Compares the current photo data with last saved data to avoid unnecessary uploads.
     * - Updates the browser history with the new resume ID if it changed.
     * - Handles errors by showing a toast with a retry button.
     */
    async function save() {
      try {
        setIsSaving(true);
        setIsError(false);

        const newData = structuredClone(debouncedResumeData);

        // If the photo data is unchanged, omit it from the save to reduce payload
        const photoUnchanged =
          JSON.stringify(lastSavedData.photo, fileReplacer) ===
          JSON.stringify(newData.photo, fileReplacer);

        const updatedResume = await saveResume({
          ...newData,
          ...(photoUnchanged && { photo: undefined }),
          id: resumeId,
        });

        // Update local states after a successful save
        setResumeId(updatedResume.id);
        setLastSavedData(newData);

        // If the URL doesn't match the saved resume ID, update it
        if (searchParams.get("resumeId") !== updatedResume.id) {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("resumeId", updatedResume.id);
          window.history.replaceState(null, "", `?${newSearchParams.toString()}`);
        }
      } catch (error) {
        // If an error occurs, show a toast with a retry option
        setIsError(true);
        console.error(error);
        const { dismiss } = toast({
          variant: "destructive",
          description: (
            <div className="space-y-3">
              <p>Could not save changes.</p>
              <Button
                variant="secondary"
                onClick={() => {
                  dismiss();
                  save(); // Retry saving when the user clicks "Retry"
                }}
              >
                Retry
              </Button>
            </div>
          ),
        });
      } finally {
        setIsSaving(false);
      }
    }

    // Debug logs (optional)
    console.log(
      "debouncedResumeData",
      JSON.stringify(debouncedResumeData, fileReplacer),
    );
    console.log("lastSavedData", JSON.stringify(lastSavedData, fileReplacer));

    // Determine if there are unsaved changes by comparing current and last saved data
    const hasUnsavedChanges =
      JSON.stringify(debouncedResumeData, fileReplacer) !==
      JSON.stringify(lastSavedData, fileReplacer);

    // Trigger the save if:
    // - There are unsaved changes
    // - We have debounced data available
    // - We are not currently saving
    // - We do not have an error state preventing immediate re-save
    if (hasUnsavedChanges && debouncedResumeData && !isSaving && !isError) {
      save();
    }
  }, [
    debouncedResumeData,
    isSaving,
    lastSavedData,
    isError,
    resumeId,
    searchParams,
    toast,
  ]);

  return {
    isSaving,
    hasUnsavedChanges:
      JSON.stringify(resumeData) !== JSON.stringify(lastSavedData),
  };
}
