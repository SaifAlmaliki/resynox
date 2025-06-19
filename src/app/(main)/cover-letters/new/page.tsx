'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserResumes } from "@/lib/actions/resume.actions";
import { getCurrentUser } from "@/lib/actions/interview.actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface BasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coverLetterTitle: string;
}

export default function NewCoverLetterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [useResume, setUseResume] = useState<boolean | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    coverLetterTitle: ''
  });
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionError, setJobDescriptionError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumes, setResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [enhancingParagraph, setEnhancingParagraph] = useState<number | null>(null);

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

  const validateBasicInfo = () => {
    if (!useResume) {
      if (!basicInfo.firstName.trim() || !basicInfo.lastName.trim() || !basicInfo.email.trim()) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in your name and email address."
        });
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(basicInfo.email)) {
        toast({
          variant: "destructive", 
          title: "Invalid Email",
          description: "Please enter a valid email address."
        });
        return false;
      }
      if (!basicInfo.address.trim() || !basicInfo.city.trim()) {
        toast({
          variant: "destructive",
          title: "Missing Address Information",
          description: "Please fill in your address and city."
        });
        return false;
      }
      if (!basicInfo.coverLetterTitle.trim()) {
        toast({
          variant: "destructive",
          title: "Missing Cover Letter Title",
          description: "Please enter a title for your cover letter."
        });
        return false;
      }
    }
    return true;
  };

  const getTotalSteps = () => {
    if (useResume) return 3; // Select Resume -> Job Description -> Cover Letter
    return 4; // Choose Path -> Basic Info -> Job Description -> Cover Letter
  };

  const handleNext = () => {
    const totalSteps = getTotalSteps();
    
    // Validation based on current step and path
    if (step === 1 && useResume === null) {
      toast({
        variant: "destructive",
        title: "Please Choose",
        description: "Please select whether to use a resume or create without one."
      });
      return;
    }
    
    if (step === 1 && useResume && !selectedResume) {
      toast({
        variant: "destructive",
        title: "Please Select",
        description: "Please select a resume to continue."
      });
      return;
    }

    if (step === 2 && !useResume && !validateBasicInfo()) {
      return;
    }

    if ((step === 2 && useResume) || (step === 3 && !useResume)) {
      if (!validateJobDescription()) {
        return;
      }
      // Validate cover letter title for resume users
      if (useResume && !basicInfo.coverLetterTitle.trim()) {
        toast({
          variant: "destructive",
          title: "Missing Cover Letter Title",
          description: "Please enter a title for your cover letter."
        });
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    const requiredFields = useResume 
      ? [selectedResume, jobDescription, coverLetter]
      : [basicInfo.firstName, basicInfo.lastName, basicInfo.email, jobDescription, coverLetter];
    
    if (requiredFields.some(field => !field)) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please complete all steps before saving.",
      });
      return;
    }

    try {
      const requestBody: any = {
        jobDescription,
        content: coverLetter,
        title: basicInfo.coverLetterTitle,
      };

      if (useResume) {
        requestBody.resumeId = selectedResume;
      } else {
        requestBody.basicInfo = basicInfo;
      }

      const response = await fetch("/api/cover-letters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
    if ((!useResume && !validateBasicInfo()) || !jobDescription) return;
    setGeneratingCoverLetter(true);
    try {
      const requestBody: any = {
        jobDescription,
      };

      if (useResume) {
        requestBody.resumeId = selectedResume;
      } else {
        requestBody.basicInfo = basicInfo;
      }

      const response = await fetch("/api/cover-letters/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
        description: "Failed to generate cover letter. Please try again."
      });
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const enhanceParagraph = async (paragraphIndex: number) => {
    if (!coverLetter?.trim()) return;
    
    setEnhancingParagraph(paragraphIndex);
    try {
      const response = await fetch("/api/cover-letters/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paragraph: coverLetter.trim(),
          jobDescription,
          context: useResume ? 'resume-based' : 'standalone'
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to enhance cover letter");
      }
      
      const data = await response.json();
      setCoverLetter(data.enhancedParagraph);
      
      toast({
        title: "Enhanced!",
        description: "Your cover letter has been enhanced with AI suggestions."
      });
    } catch (error) {
      console.error("Error enhancing cover letter:", error);
      toast({
        variant: "destructive",
        title: "Enhancement Failed",
        description: "Failed to enhance cover letter. Please try again."
      });
    } finally {
      setEnhancingParagraph(null);
    }
  };

  useEffect(() => {
    const totalSteps = getTotalSteps();
    if (step === totalSteps) {
      generateCoverLetter();
    }
  }, [step]);

  const renderProgressSteps = () => {
    const totalSteps = getTotalSteps();
    const steps = [];
    
    for (let i = 1; i <= totalSteps; i++) {
      steps.push(i);
    }

    return steps.map((stepNumber) => (
      <div
        key={stepNumber}
        className={`flex items-center ${
          stepNumber < totalSteps ? 'flex-1' : ''
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
        {stepNumber < totalSteps && (
          <div
            className={`flex-1 h-1 mx-2 ${
              step > stepNumber
                ? 'bg-green-600'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        )}
      </div>
    ));
  };

  const renderCoverLetterWithEnhancement = () => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="min-h-[400px] w-full"
            placeholder="Your cover letter will appear here..."
          />
        </div>
        <div className="flex justify-center">
          <Button
            onClick={generateCoverLetter}
            disabled={generatingCoverLetter}
            variant="outline"
            className="min-w-[150px]"
          >
            {generatingCoverLetter ? "Regenerating..." : "🔄 Regenerate"}
          </Button>
        </div>
      </div>
    );
  };

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
          {renderProgressSteps()}
        </div>

        <Card className="p-6">
          {/* Step 1: Choose Path or Select Resume */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Choose Your Approach</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                How would you like to create your cover letter?
              </p>
              
              {loadingResumes ? (
                <div className="text-center py-8">Loading resumes...</div>
              ) : (
                <div className="space-y-4">
                  {/* Option 1: Use Resume */}
                  <div 
                    className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                      useResume === true ? "border-green-600 bg-green-50 dark:bg-green-900/20" : "border-gray-200 hover:border-green-400"
                    }`}
                    onClick={() => setUseResume(true)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Use Existing Resume</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Base your cover letter on one of your existing resumes for better personalization
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        useResume === true ? "bg-green-600 border-green-600" : "border-gray-300"
                      }`} />
                    </div>
                    
                    {useResume === true && (
                      <div className="mt-4 pt-4 border-t">
                        {resumes.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              No resumes found. Please create a resume first.
                            </p>
                            <Button asChild>
                              <Link href="/resumes">Create Resume</Link>
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {resumes.map((resume) => (
                              <div
                                key={resume.id}
                                className={`border rounded p-3 cursor-pointer transition-colors ${
                                  selectedResume === resume.id
                                    ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                                    : "border-gray-200 hover:border-green-400"
                                }`}
                                onClick={() => setSelectedResume(resume.id)}
                              >
                                <div className="font-medium text-sm">{resume.title || "No title"}</div>
                                <div className="text-xs text-gray-500">
                                  {resume.description || "No description"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Option 2: Create Without Resume */}
                  <div 
                    className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                      useResume === false ? "border-green-600 bg-green-50 dark:bg-green-900/20" : "border-gray-200 hover:border-green-400"
                    }`}
                    onClick={() => setUseResume(false)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Create Without Resume</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Start fresh and create a cover letter from scratch with AI assistance
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        useResume === false ? "bg-green-600 border-green-600" : "border-gray-300"
                      }`} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Basic Info (only if not using resume) */}
          {step === 2 && !useResume && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tell us about yourself so we can personalize your cover letter
              </p>
              
              {/* Cover Letter Title - Full Width */}
              <div className="mb-6">
                <Label htmlFor="coverLetterTitle" className="text-base font-medium">Cover Letter Title *</Label>
                <Input
                  id="coverLetterTitle"
                  type="text"
                  value={basicInfo.coverLetterTitle}
                  onChange={(e) => setBasicInfo({...basicInfo, coverLetterTitle: e.target.value})}
                  placeholder="e.g., Software Engineer at Google, Marketing Manager Position, etc."
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Give your cover letter a descriptive title to help you distinguish it from others
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={basicInfo.firstName}
                    onChange={(e) => setBasicInfo({...basicInfo, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={basicInfo.lastName}
                    onChange={(e) => setBasicInfo({...basicInfo, lastName: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={basicInfo.email}
                    onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={basicInfo.phone}
                    onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    type="text"
                    value={basicInfo.address}
                    onChange={(e) => setBasicInfo({...basicInfo, address: e.target.value})}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    type="text"
                    value={basicInfo.city}
                    onChange={(e) => setBasicInfo({...basicInfo, city: e.target.value})}
                    placeholder="Berlin"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Region</Label>
                  <Input
                    id="state"
                    type="text"
                    value={basicInfo.state}
                    onChange={(e) => setBasicInfo({...basicInfo, state: e.target.value})}
                    placeholder="Berlin"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={basicInfo.zipCode}
                    onChange={(e) => setBasicInfo({...basicInfo, zipCode: e.target.value})}
                    placeholder="10999"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Job Description Step */}
          {((step === 2 && useResume) || (step === 3 && !useResume)) && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Job Description & Cover Letter Title</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Give your cover letter a title and paste the job description for the position you're applying to
              </p>
              
              {/* Cover Letter Title for Resume Users */}
              {useResume && (
                <div className="mb-6">
                  <Label htmlFor="coverLetterTitleResume" className="text-base font-medium">Cover Letter Title *</Label>
                  <Input
                    id="coverLetterTitleResume"
                    type="text"
                    value={basicInfo.coverLetterTitle}
                    onChange={(e) => setBasicInfo({...basicInfo, coverLetterTitle: e.target.value})}
                    placeholder="e.g., Software Engineer at Google, Marketing Manager Position, etc."
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Give your cover letter a descriptive title to help you distinguish it from others
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="jobDescription" className="text-base font-medium">Job Description *</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  className="min-h-[200px] mt-2"
                />
                {jobDescriptionError && (
                  <p className="text-red-500 mt-2">{jobDescriptionError}</p>
                )}
              </div>
            </div>
          )}

          {/* Generated Cover Letter Step */}
          {((step === 3 && useResume) || (step === 4 && !useResume)) && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Cover Letter</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Review and edit your cover letter. Use the "Enhance" buttons to improve individual paragraphs with AI.
              </p>
              {generatingCoverLetter ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p>Generating your personalized cover letter...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {renderCoverLetterWithEnhancement()}
                </div>
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
            {step < getTotalSteps() ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={generatingCoverLetter}>
                Save Cover Letter
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 