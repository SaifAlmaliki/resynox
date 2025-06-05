"use client";

import { useEffect, useState } from "react";
import React from "react";
import { getCurrentUser } from "@/lib/actions/interview.actions";
import { generateInterviewQuestions, createInterview } from "@/lib/actions/interview.actions";

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
import { X, Plus, Loader2 } from "lucide-react";
import { Agent } from "@/components/interview/Agent";

// Define type for user
type User = {
  id: string;
  name: string;
  email: string;
};

// Inline implementation of Step and Stepper components
interface StepProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
}

const Step: React.FC<StepProps> = ({ 
  label, 
  description, 
  icon, 
  isCompleted, 
  isActive 
}) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
          isActive && "border-primary bg-primary text-primary-foreground",
          isCompleted && "border-primary bg-primary text-primary-foreground",
          !isActive && !isCompleted && "border-muted-foreground/20 bg-background text-muted-foreground"
        )}
      >
        {icon || (isCompleted ? "✓" : label.charAt(0))}
      </div>
      <div className="mt-2 text-center">
        <div className={cn(
          "text-sm font-medium",
          isActive && "text-foreground",
          !isActive && "text-muted-foreground"
        )}>
          {label}
        </div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  );
};

interface StepperProps {
  activeStep: number;
  children: React.ReactNode;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({ activeStep, children, className }) => {
  const steps = React.Children.toArray(children);

  return (
    <div className={cn("flex w-full justify-between", className)}>
      {steps.map((step, index) => {
        if (React.isValidElement<StepProps>(step)) {
          return React.cloneElement(step, {
            ...step.props,
            key: index,
            isActive: activeStep === index,
            isCompleted: activeStep > index,
          });
        }
        return step;
      })}
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
  const [activeStep, setActiveStep] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  
  // Fetch user and resumes on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData as User);
      }
      
      if (userData?.id) {
        const userResumes = await getUserResumes(userData.id);
        setResumes(userResumes);
        
        // Select the most recent resume by default if available
        if (userResumes.length > 0) {
          const sortedResumes = [...userResumes].sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setSelectedResumeId(sortedResumes[0].id);
          setSelectedResume(sortedResumes[0]);
          setTargetRole(sortedResumes[0].jobTitle || "");
          setTechStack(sortedResumes[0].skills || []);
        }
      }
    };
    
    fetchUserData();
  }, []);
  
  // Update selected resume when selection changes
  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    const resume = resumes.find(r => r.id === resumeId);
    if (resume) {
      setSelectedResume(resume);
      setTargetRole(resume.jobTitle || "");
      setTechStack(resume.skills || []);
    }
  };
  
  // Add a new technology to the tech stack
  const addTechItem = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech("");
    }
  };
  
  // Remove a technology from the tech stack
  const removeTechItem = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };
  
  // Generate interview questions based on resume and additional info
  const generateQuestions = async () => {
    if (!selectedResume || !targetRole || !experienceLevel || techStack.length === 0 || !user) {
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Prepare resume data for question generation
      const resumeData = {
        jobTitle: selectedResume.jobTitle || "",
        summary: selectedResume.summary || "",
        skills: selectedResume.skills || [],
        // Add any other relevant resume fields
      };
      
      // Generate questions using the interview actions
      const questions = await generateInterviewQuestions({
        userId: user.id,
        role: targetRole,
        level: experienceLevel,
        techstack: techStack,
        resumeData,
      });
      
      setGeneratedQuestions(questions);
      setActiveStep(2); // Move to questions preview step
    } catch (error) {
      console.error("Error generating questions:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Start the interview with generated questions
  const startInterview = async () => {
    if (generatedQuestions.length === 0 || !user) return;
    
    setIsStartingInterview(true);
    
    try {
      // Create a new interview in the database
      const result = await createInterview({
        userId: user.id,
        role: targetRole,
        level: experienceLevel,
        questions: generatedQuestions,
        techstack: techStack,
        type: "ai-mock",
        skipQuestionSelection: true,
      });
      
      if (result?.interviewId) {
        setInterviewId(result.interviewId);
        setActiveStep(3); // Move to interview step
      }
    } catch (error) {
      console.error("Error starting interview:", error);
    } finally {
      setIsStartingInterview(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Personalized Interview</h1>
      
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <p className="text-muted-foreground">
          Create a personalized interview based on your resume data and preferences.
          Our AI will generate tailored questions to help you practice for your target role.
        </p>
      </div>
      
      {/* Stepper for wizard navigation */}
      <Stepper activeStep={activeStep} className="mb-8">
        <Step label="Select Resume" />
        <Step label="Interview Details" />
        <Step label="Review Questions" />
        <Step label="Start Interview" />
      </Stepper>
      
      {/* Step 1: Resume Selection */}
      {activeStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Resume</CardTitle>
          </CardHeader>
          <CardContent>
            {resumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumes.map((resume) => (
                  <div 
                    key={resume.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedResumeId === resume.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onClick={() => handleResumeSelect(resume.id)}
                  >
                    <div className="font-medium text-lg">{resume.title || 'Untitled Resume'}</div>
                    <div className="text-sm text-muted-foreground">{resume.jobTitle || 'No job title'}</div>
                    <div className="text-xs text-muted-foreground mt-2">Updated: {formatDate(resume.updatedAt)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You don&apos;t have any resumes yet.</p>
                <Button asChild>
                  <a href="/resumes/create">Create a Resume</a>
                </Button>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setActiveStep(1)}
                disabled={!selectedResumeId}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Interview Details */}
      {activeStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Target Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Target Role</Label>
                <Input 
                  id="role" 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              
              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select experience level" />
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
              
              {/* Technology Stack */}
              <div className="space-y-2">
                <Label>Technology Stack</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button 
                        type="button" 
                        onClick={() => removeTechItem(tech)}
                        className="ml-1 rounded-full hover:bg-muted p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    value={newTech} 
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="Add technology"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechItem())}
                  />
                  <Button type="button" onClick={addTechItem} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveStep(0)}>
                Back
              </Button>
              <Button 
                onClick={generateQuestions}
                disabled={!targetRole || !experienceLevel || techStack.length === 0 || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Questions'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Review Generated Questions */}
      {activeStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Interview Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="font-medium mb-2">Interview Details:</div>
                <div className="text-sm">Role: {targetRole}</div>
                <div className="text-sm">Experience: {experienceLevels.find(l => l.value === experienceLevel)?.label}</div>
                <div className="text-sm">Technologies: {techStack.join(', ')}</div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Generated Questions:</div>
                <ol className="list-decimal list-inside space-y-2">
                  {generatedQuestions.map((question, index) => (
                    <li key={index} className="p-3 bg-card border rounded-lg">{question}</li>
                  ))}
                </ol>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveStep(1)}>
                Back
              </Button>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={generateQuestions}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate Questions'
                  )}
                </Button>
                <Button 
                  onClick={startInterview}
                  disabled={generatedQuestions.length === 0 || isStartingInterview}
                >
                  {isStartingInterview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 4: Conduct Interview */}
      {activeStep === 3 && interviewId && (
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Interview in Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your personalized interview is ready. Click the button below to start speaking with our AI interviewer.
                Answer the questions naturally as you would in a real interview.
              </p>
            </CardContent>
          </Card>
          
          <Agent
            userName={selectedResume?.firstName || user?.name || 'User'}
            userId={user?.id}
            interviewId={interviewId}
            type="interview"
            questions={generatedQuestions}
          />
        </div>
      )}
    </div>
  );
};

export default InterviewGeneratePage;
