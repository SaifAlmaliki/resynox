'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserResumes } from "@/lib/actions/resume.actions";
import { getCurrentUser } from "@/lib/actions/interview.actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function NewCoverLetterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionError, setJobDescriptionError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumes, setResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  useEffect(() => {
    async function fetchResumes() {
      setLoadingResumes(true);
      try {
        const userData = await getCurrentUser();
        if (userData?.id) {
          const data = await getUserResumes(userData.id);
          setResumes(data);
        }
      } catch (error) {
        console.error("Error fetching resumes:", error);
      } finally {
        setLoadingResumes(false);
      }
    }
    fetchResumes();
  }, []);

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
      const response = await fetch("/api/cover-letters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: selectedResume,
          jobDescription,
          content: coverLetter,
          title: "Cover Letter for " + jobDescription.substring(0, 30) + "...",
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        
        // Handle subscription limit errors specifically
        if (response.status === 403 && errorText.includes("Cover letter limit reached")) {
          if (errorText.includes("free users")) {
            toast({
              variant: "destructive",
              title: "Cover Letter Limit Reached",
              description: "You've reached your free tier limit (1 cover letter). Upgrade to Pro for 3 cover letters or Pro Plus for 10 cover letters.",
              action: (
                <Button asChild variant="outline" size="sm">
                  <Link href="/billing">Upgrade Now</Link>
                </Button>
              ),
            });
          } else {
            toast({
              variant: "destructive",
              title: "Cover Letter Limit Reached",
              description: errorText,
              action: (
                <Button asChild variant="outline" size="sm">
                  <Link href="/billing">Upgrade Plan</Link>
                </Button>
              ),
            });
          }
          return;
        }
        
        // Handle other errors
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: `Failed to save cover letter: ${errorText}`,
        });
        return;
      }
      
      const result = await response.json();
      console.log("Cover letter saved successfully:", result);
      
      toast({
        title: "Success!",
        description: "Your cover letter has been saved successfully.",
      });
      
      router.push('/cover-letters');
    } catch (error) {
      console.error("Error saving cover letter:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save cover letter: ${errorMessage}`,
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
      alert("Failed to generate cover letter. Please try again.");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  useEffect(() => {
    if (step === 3) {
      generateCoverLetter();
    }
  }, [step]);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Cover Letter</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Follow these steps to create a tailored cover letter
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
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-400"
                      }`}
                      onClick={() => setSelectedResume(resume.id)}
                    >
                      <div className="font-semibold">{resume.title || "No title"}</div>
                      <div className="text-sm text-gray-500">
                        {resume.description || "No description"}
                      </div>
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
                Paste the job description you're applying for
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
              <h2 className="text-xl font-semibold mb-4">Generated Cover Letter</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Review and edit your generated cover letter
              </p>
              {generatingCoverLetter ? (
                <div>Generating cover letter...</div>
              ) : (
                <>
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Your cover letter will appear here..."
                    className="min-h-[300px]"
                  />
                  <Button onClick={generateCoverLetter} className="mt-4">
                    Regenerate Cover Letter
                  </Button>
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
              <Button onClick={handleSave}>Save Cover Letter</Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 