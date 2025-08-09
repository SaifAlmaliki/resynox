"use client";

import { useEffect, useState } from "react";
import React from "react";
import { getCurrentUser } from "@/lib/actions/interview.actions";
import { createInterview } from "@/lib/actions/interview.actions";

// Import only the type from resume actions to avoid conflicts
import { getUserResumes, type Resume } from "../../../../lib/actions/resume.actions";

// Import the function separately to avoid naming conflicts
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
// Inline Stepper component implementation
import { cn } from "@/lib/utils";
import { X, Plus, Loader2, Lock, ArrowRight } from "lucide-react";
import { Agent } from "@/components/interview/Agent";
import { useSubscriptionLevel } from "../../SubscriptionLevelProvider";
import { canUseVoiceAgent } from "@/lib/permissions";
import usePremiumModal from "@/hooks/usePremiumModal";
import Link from "next/link";

// Define type for user
type User = {
  id: string;
  name: string;
  email: string;
};

// Inline Stepper implementation
interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div 
            className={cn(
              "flex items-center cursor-pointer",
              index <= currentStep ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => onStepClick(index)}
          >
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                index <= currentStep 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background border-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:inline">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={cn(
                "flex-1 h-0.5 mx-4",
                index < currentStep ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Define experience level options
const experienceLevels = [
  { value: "entry", label: "Entry-level" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead/Manager" },
  { value: "executive", label: "Executive" },
];

// Component to display and manage interview setup wizard
const InterviewGeneratePage = () => {
  const subscriptionLevel = useSubscriptionLevel();
  const hasVoiceAgentAccess = canUseVoiceAgent(subscriptionLevel);
  const premiumModal = usePremiumModal();

  const [activeStep, setActiveStep] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  // Voice interviews don't need resume selection - ElevenLabs handles everything dynamically
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const [voiceUsageStatus, setVoiceUsageStatus] = useState<{ canUse: boolean; used: number; limit: number }>({ canUse: false, used: 0, limit: 0 });

  // Check voice interview usage status
  useEffect(() => {
    const checkVoiceUsage = async () => {
      if (hasVoiceAgentAccess) {
        try {
          const response = await fetch('/api/voice-interview-status');
          if (response.ok) {
            const status = await response.json();
            setVoiceUsageStatus(status);
          }
        } catch (error) {
          console.error('Error checking voice usage:', error);
        }
      }
    };
    checkVoiceUsage();
  }, [hasVoiceAgentAccess]);

  // Load user data and resumes on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          const resumeData = await getUserResumes(userData.id);
          setResumes(resumeData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Check access and show upgrade prompt if needed
  if (!hasVoiceAgentAccess) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <Card className="border-2 border-orange-200 bg-orange-50/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-orange-800">Voice Agent Interviews - Pro Plus Feature</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-orange-700 text-lg">
              Advanced AI voice interviewer with feedback is available exclusively for Pro Plus subscribers.
            </p>
            <div className="bg-white/80 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-orange-800">Pro Plus Features Include:</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• 5 voice agent interviews per month</li>
                <li>• AI interview feedback & analysis</li>
                <li>• Plus all Pro features</li>
              </ul>
            </div>
            <div className="pt-4 flex gap-3 justify-center">
              <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
                <Link href="/billing">
                  Upgrade to Pro Plus <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" onClick={() => premiumModal.setOpen(true)}>
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has reached their monthly limit
  if (!voiceUsageStatus.canUse && voiceUsageStatus.limit > 0) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Monthly Voice Interview Limit Reached</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-700 text-lg">
              You&apos;ve used all {voiceUsageStatus.limit} voice interviews for this billing period.
            </p>
            <div className="bg-white/80 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-red-800">Usage Summary:</h4>
              <p className="text-sm text-red-700">
                {voiceUsageStatus.used} of {voiceUsageStatus.limit} interviews completed this month
              </p>
              <p className="text-sm text-red-600">
                Your limit will reset on your next billing cycle.
              </p>
            </div>
            <div className="pt-4">
              <Button asChild size="lg" variant="outline">
                <Link href="/interview">
                  Back to Interviews <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Voice interviews skip question generation since ElevenLabs handles questions dynamically
  const steps = ["Select Resume", "Configure Interview", "Start Interview"];

  // Handle resume selection
  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    const resume = resumes.find(r => r.id === resumeId);
    
    // Auto-populate fields from resume
    if (resume) {
      setTargetRole(resume.jobTitle || "");
      if (resume.skills && resume.skills.length > 0) {
        setTechStack(resume.skills);
      }
    }
  };

  // Add technology to stack
  const addTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech("");
    }
  };

  // Remove technology from stack
  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  // Voice interviews skip question generation - ElevenLabs handles questions dynamically

  // Voice interviews skip question generation - ElevenLabs handles questions dynamically

  // Start the interview
  const handleStartInterview = async () => {
    if (!user || !targetRole || techStack.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsStartingInterview(true);
    try {
      const result = await createInterview({
        userId: user.id,
        role: targetRole,
        level: experienceLevel,
        questions: [], // Voice interviews don't need pre-generated questions
        techstack: techStack,
        type: "voice"
      });

             if (result.success && result.interviewId) {
         setInterviewId(result.interviewId);
         // The Agent component will handle the actual interview start
       } else {
         throw new Error("Failed to create interview");
       }
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start interview. Please try again.");
      setIsStartingInterview(false);
    }
  };

  // Show usage status at the top
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      {/* Usage Status Card */}
      <Card className="mb-6 border-green-200 bg-green-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-800">Voice Interview Usage</h3>
              <p className="text-sm text-green-700">
                {voiceUsageStatus.used} of {voiceUsageStatus.limit} interviews used this month
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-800">
                {voiceUsageStatus.limit - voiceUsageStatus.used}
              </div>
              <div className="text-xs text-green-600">remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show Agent component if interview is started */}
      {interviewId && (
        <Agent
          userId={user?.id || ""}
          interviewId={interviewId}
          type="interview"
          role={targetRole}
          level={experienceLevel}
          techstack={techStack}
        />
      )}

      {/* Interview Setup Wizard */}
      {!interviewId && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Voice Interview</CardTitle>
            <Stepper 
              steps={steps} 
              currentStep={activeStep} 
              onStepClick={setActiveStep}
            />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Select Resume */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select a Resume (Optional)</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a resume to auto-populate interview details, or skip to configure manually.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resumes.map((resume) => (
                    <Card 
                      key={resume.id} 
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        selectedResumeId === resume.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleResumeSelect(resume.id)}
                    >
                      <CardContent className="pt-4">
                        <h4 className="font-medium">{resume.title || "Untitled Resume"}</h4>
                        <p className="text-sm text-muted-foreground">
                          {resume.jobTitle || "No job title"}
                        </p>
                        {resume.skills && resume.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {resume.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {resume.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{resume.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveStep(1)}>
                    Skip Resume Selection
                  </Button>
                  <Button 
                    onClick={() => setActiveStep(1)}
                    disabled={!selectedResumeId}
                  >
                    Continue with Selected Resume
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Configure Interview */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configure Interview</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="targetRole">Target Role</Label>
                    <Input
                      id="targetRole"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Frontend Developer, Data Scientist"
                    />
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Technology Stack</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        placeholder="Add a technology (e.g., React, Python)"
                        onKeyPress={(e) => e.key === 'Enter' && addTech()}
                      />
                      <Button type="button" onClick={addTech} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="cursor-pointer">
                          {tech}
                          <X 
                            className="h-3 w-3 ml-1" 
                            onClick={() => removeTech(tech)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveStep(0)}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => setActiveStep(2)}
                    disabled={!targetRole || techStack.length === 0}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Start Interview */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ready to Start Voice Interview</h3>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Interview Summary</h4>
                  <p><strong>Role:</strong> {targetRole}</p>
                  <p><strong>Level:</strong> {experienceLevels.find(l => l.value === experienceLevel)?.label}</p>
                  <p><strong>Technologies:</strong> {techStack.join(", ")}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-800">Voice Interview Features</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• AI interviewer generates questions dynamically based on your profile</li>
                    <li>• Natural conversation flow with follow-up questions</li>
                    <li>• Real-time voice interaction with ElevenLabs AI</li>
                    <li>• Comprehensive feedback provided after completion</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-800">Before You Start</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Make sure you're in a quiet environment</li>
                    <li>• Allow microphone access when prompted</li>
                    <li>• Speak clearly and at a normal pace</li>
                    <li>• Take your time to think before answering</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveStep(1)}>
                    Back
                  </Button>
                  <Button onClick={handleStartInterview} disabled={isStartingInterview}>
                    {isStartingInterview ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting Interview...
                      </>
                    ) : (
                      "Start Voice Interview"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterviewGeneratePage;
