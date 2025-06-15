'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserResumes } from "@/lib/actions/resume.actions";
import { getCurrentUser } from "@/lib/actions/interview.actions";
import { useToast } from "@/hooks/use-toast";

interface CoverLetterData {
  id: string;
  title: string;
  content: string;
  jobDescription: string;
  resumeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function EditCoverLetterPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionError, setJobDescriptionError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [coverLetterTitle, setCoverLetterTitle] = useState("");
  const [resumes, setResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [loadingCoverLetter, setLoadingCoverLetter] = useState(true);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [originalCoverLetter, setOriginalCoverLetter] = useState<CoverLetterData | null>(null);

  // Fetch cover letter data and resumes
  useEffect(() => {
    fetchCoverLetterAndResumes();
  }, [params.id]);

  const fetchCoverLetterAndResumes = async () => {
    try {
      setLoadingCoverLetter(true);
      setLoadingResumes(true);

      // Fetch cover letter data
      const coverLetterResponse = await fetch(`/api/cover-letters/${params.id}`);
      if (!coverLetterResponse.ok) {
        if (coverLetterResponse.status === 404) {
          toast({
            variant: "destructive",
            title: "Cover letter not found",
            description: "The cover letter you're looking for doesn't exist.",
          });
          router.push('/cover-letters');
          return;
        }
        throw new Error('Failed to fetch cover letter');
      }

      const coverLetterData = await coverLetterResponse.json();
      const coverLetterObj: CoverLetterData = {
        ...coverLetterData,
        createdAt: new Date(coverLetterData.createdAt),
        updatedAt: new Date(coverLetterData.updatedAt),
      };

      setOriginalCoverLetter(coverLetterObj);
      setSelectedResume(coverLetterObj.resumeId);
      setJobDescription(coverLetterObj.jobDescription);
      setCoverLetter(coverLetterObj.content);
      setCoverLetterTitle(coverLetterObj.title || "");

      // Fetch user resumes
      const userData = await getCurrentUser();
      if (userData?.id) {
        const resumesData = await getUserResumes(userData.id);
        setResumes(resumesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cover letter. Please try again.",
      });
      router.push('/cover-letters');
    } finally {
      setLoadingCoverLetter(false);
      setLoadingResumes(false);
    }
  };

  const validateJobDescription = () => {
    if (!jobDescription.trim()) {
      setJobDescriptionError("Job description cannot be empty.");
      return false;
    }
    if (jobDescription.trim().length < 50) {
      setJobDescriptionError("Job description must be at least 50 characters long.");
      return false;
    }
    setJobDescriptionError("");
    return true;
  };

  const handleNext = () => {
    if (step === 2 && !validateJobDescription()) {
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    if (!selectedResume || !jobDescription || !coverLetter) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please complete all steps before saving.",
      });
      return;
    }

    try {
      const response = await fetch(`/api/cover-letters/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: selectedResume,
          jobDescription,
          content: coverLetter,
          title: coverLetterTitle || `Cover Letter for ${jobDescription.substring(0, 30)}...`,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: `Failed to update cover letter: ${errorText}`,
        });
        return;
      }
      
      const result = await response.json();
      console.log("Cover letter updated successfully:", result);
      
      toast({
        title: "Success!",
        description: "Your cover letter has been updated successfully.",
      });
      
      router.push('/cover-letters');
    } catch (error) {
      console.error("Error updating cover letter:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update cover letter: ${errorMessage}`,
      });
    }
  };

  const generateCoverLetter = async () => {
    if (!selectedResume || !jobDescription) return;
    setGeneratingCoverLetter(true);
    try {
      const response = await fetch("/api/cover-letters/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: selectedResume,
          jobDescription,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }
      const data = await response.json();
      setCoverLetter(data.content);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate cover letter. Please try again.",
      });
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  // Auto-generate when moving to step 3 (only if content is empty or user wants to regenerate)
  useEffect(() => {
    if (step === 3 && !coverLetter) {
      generateCoverLetter();
    }
  }, [step]);

  if (loadingCoverLetter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading cover letter...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Cover Letter</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your cover letter by following these steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex items-center ${
                stepNumber < 3 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > stepNumber
                      ? 'bg-green-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="p-6">
          {/* Step 1: Select Resume */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select a Resume</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose the resume you want to base your cover letter on
              </p>
              {loadingResumes ? (
                <div>Loading resumes...</div>
              ) : resumes.length === 0 ? (
                <div>No resumes found. Please create a resume first.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`border rounded p-4 cursor-pointer transition-colors ${
                        selectedResume === resume.id
                          ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 hover:border-green-400"
                      }`}
                      onClick={() => setSelectedResume(resume.id)}
                    >
                      <div className="font-semibold">{resume.title || "No title"}</div>
                      <div className="text-sm text-gray-500">
                        {resume.description || "No description"}
                      </div>
                      {selectedResume === resume.id && (
                        <div className="text-xs text-green-600 mt-2">✓ Currently selected</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Job Description */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Update the job description you're applying for
              </p>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="min-h-[200px]"
              />
              {jobDescriptionError && (
                <p className="text-red-500 mt-2">{jobDescriptionError}</p>
              )}
            </div>
          )}

          {/* Step 3: Generated Cover Letter */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Cover Letter Content</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Review and edit your cover letter content
              </p>
              {generatingCoverLetter ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Generating cover letter...</p>
                </div>
              ) : (
                <>
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Your cover letter content will appear here..."
                    className="min-h-[300px]"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={generateCoverLetter} variant="outline">
                      Regenerate Cover Letter
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} disabled={step === 1 && !selectedResume}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSave}>Update Cover Letter</Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
} 