import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import useDebounce from "@/hooks/useDebounce";
import { fileReplacer } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { saveResume } from "./actions";

export default function useAutoSaveResume(resumeData: ResumeValues) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const debouncedResumeData = useDebounce(resumeData, 1500);

  const [resumeId, setResumeId] = useState(resumeData.id);
  const [lastSavedData, setLastSavedData] = useState(structuredClone(resumeData));
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(debouncedResumeData, fileReplacer) !== JSON.stringify(lastSavedData, fileReplacer);
  }, [debouncedResumeData, lastSavedData]);

  useEffect(() => {
    setIsError(false);
  }, [debouncedResumeData]);

  useEffect(() => {
    async function save() {
      try {
        setIsSaving(true);
        setIsError(false);

        const newData = structuredClone(debouncedResumeData);
        const photoUnchanged = JSON.stringify(lastSavedData.photo, fileReplacer) === JSON.stringify(newData.photo, fileReplacer);

        const updatedResume = await saveResume({
          ...newData,
          ...(photoUnchanged && { photo: undefined }),
          id: resumeId,
        });

        setResumeId(updatedResume.id);
        setLastSavedData(newData);

        if (searchParams.get("resumeId") !== updatedResume.id) {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("resumeId", updatedResume.id);
          window.history.replaceState(null, "", `?${newSearchParams.toString()}`);
        }
      } catch (error) {
        setIsError(true);
        console.error(error);
        const { dismiss } = toast({
          variant: "destructive",
          description: (
            <div className="space-y-3">
              <p>Could not save changes.</p>
              <Button variant="secondary" onClick={() => {
                dismiss();
                save();
              }}>
                Retry
              </Button>
            </div>
          ),
        });
      } finally {
        setIsSaving(false);
      }
    }

    if (hasUnsavedChanges && debouncedResumeData && !isSaving && !isError) {
      save();
    }
  }, [hasUnsavedChanges, debouncedResumeData, isSaving, isError, resumeId, searchParams, toast, lastSavedData]);

  return {
    isSaving,
    hasUnsavedChanges,
  };
}
