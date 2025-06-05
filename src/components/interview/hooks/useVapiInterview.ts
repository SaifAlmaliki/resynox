"use client";

import { useState, useCallback } from "react";
import { startVapiInterview } from "@/lib/vapi.integration";
import { createInterview, getInterviewById } from "@/lib/actions/interview.actions";
import { AgentType, CallStatus } from "@/types/interview";
import { vapiLogger } from "@/lib/vapi.logger";

// Define a type for resume data to avoid using 'any'
interface ResumeData {
  name?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  [key: string]: unknown; // Allow additional properties
}

interface UseVapiInterviewProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  type: AgentType;
  questions?: string[];
  resumeData?: ResumeData; // Resume data for generating interviews
  feedbackId?: string; // ID for feedback sessions
}

interface InterviewState {
  callStatus: CallStatus;
  error: string | null;
  createdInterviewId: string | null;
  personalizedQuestions: string[];
  personalizedRole: string;
  personalizedTechstack: string[];
}

export const useVapiInterview = ({
  userName,
  userId = '',
  interviewId = '',
  type = 'interview',
  questions = [],
  resumeData,
  feedbackId
}: UseVapiInterviewProps) => {
  // State management
  const [state, setState] = useState<InterviewState>({
    callStatus: CallStatus.INACTIVE,
    error: null,
    createdInterviewId: null,
    personalizedQuestions: [],
    personalizedRole: "",
    personalizedTechstack: []
  });

  // Handle interview generation type
  const handleGenerateInterview = useCallback(async () => {
    try {
      // Create a new interview record in the database with personalized data from resume
      const result = await createInterview({
        userId: userId!,
        role: "Full Stack Developer", // Default role - will be personalized if resume data exists
        level: "Mid-level", // Default level - will be personalized based on resume
        questions: [], // Will be populated automatically based on resume
        techstack: ["JavaScript", "React", "Node.js"], // Default tech stack - will be personalized from resume
        type: "technical", // Default type
        skipQuestionSelection: true, // Flag to skip question selection step
      });

      if (!result.success) {
        console.error("Failed to create interview record");
        setState(prev => ({
          ...prev,
          callStatus: CallStatus.INACTIVE,
          error: "Failed to create interview. Please try again."
        }));
        return null;
      }

      // Save the created interview data
      const updatedState = {
        ...state,
        createdInterviewId: result.interviewId || null
      };
      
      // Store personalized data if available
      if (result.questions && result.questions.length > 0) {
        updatedState.personalizedQuestions = result.questions;
        console.log("Starting interview with personalized questions:", result.questions);
      }
      
      if (result.role) {
        updatedState.personalizedRole = result.role;
        console.log("Using personalized role from resume:", result.role);
      }
      
      if (result.techstack && result.techstack.length > 0) {
        updatedState.personalizedTechstack = result.techstack;
        console.log("Using personalized tech stack from resume:", result.techstack);
      }
      
      setState(updatedState);
      
      // Start the interview using the VAPI integration
      const interviewResult = await startVapiInterview(
        userName || 'Candidate',
        userId || 'user-' + Date.now() + '',
        result.interviewId || '',
        updatedState.personalizedRole || 'Full Stack Developer',
        updatedState.personalizedTechstack.length > 0 ? updatedState.personalizedTechstack : ["JavaScript", "React", "Node.js"],
        'Mid-level',
        updatedState.personalizedQuestions.length > 0 ? updatedState.personalizedQuestions : [],
        'generate'
      );
      
      if (!interviewResult.success) {
        throw new Error(`Failed to start VAPI interview: ${interviewResult.error}`);
      }
      
      console.log('VAPI interview started successfully:', interviewResult);
      return interviewResult;
    } catch (error) {
      console.error("Error in handleGenerateInterview:", error);
      throw error;
    }
  }, [userName, userId, state]);

  // Handle resume-based interview type
  const handleResumeInterview = useCallback(async () => {
    // Ensure resumeData is available
    if (!resumeData) {
      vapiLogger.error("No resume data provided for interview");
      setState(prev => ({
        ...prev,
        callStatus: CallStatus.INACTIVE,
        error: "No resume data available for this interview. Please try again."
      }));
      return null;
    }
    try {
      if (!questions || questions.length === 0) {
        vapiLogger.error("No questions provided for interview");
        setState(prev => ({
          ...prev,
          callStatus: CallStatus.INACTIVE,
          error: "No questions available for this interview. Please try again."
        }));
        return null;
      }

      vapiLogger.info("Starting interview with resume data", { 
        name: resumeData.name,
        skills: resumeData.skills
      });
      
      // Log the interview details
      vapiLogger.info('Starting interview with details:', {
        interviewId,
        userId,
        questionsCount: questions.length
      });
      
      // Start the interview using the VAPI integration
      const interviewResult = await startVapiInterview(
        userName || 'Candidate',
        userId || 'user-' + Date.now() + '',
        interviewId || '',
        'Software Developer', // Default role for resume-based interview
        'General programming', // Default tech stack for resume-based interview
        'Mid-level', // Default level for resume-based interview
        questions,
        'interview' // Use 'interview' as the type instead of 'resume'
      );
      
      if (!interviewResult.success) {
        throw new Error(`Failed to start VAPI interview: ${interviewResult.error}`);
      }
      
      vapiLogger.info('VAPI interview started successfully');
      return interviewResult;
    } catch (error) {
      vapiLogger.error("Error in handleResumeInterview:", error);
      throw error;
    }
  }, [userName, userId, interviewId, questions, setState]);

  // Handle pre-defined interview type
  const handleExistingInterview = useCallback(async () => {
    try {
      if (!questions || questions.length === 0) {
        console.error("No questions provided for interview");
        setState(prev => ({
          ...prev,
          callStatus: CallStatus.INACTIVE,
          error: "No questions available for this interview. Please try again."
        }));
        return null;
      }

      console.log("Starting interview with pre-generated questions:", questions);

      // Get interview details to pass to VAPI
      let interview;
      try {
        interview = await getInterviewById(interviewId || '');
        console.log('Retrieved interview details:', interview);
      } catch (fetchError) {
        console.warn('Failed to fetch interview details, using defaults:', fetchError);
        // Continue with default values if we can't fetch the interview
      }
      
      // Use a simplified set of questions for the initial request (first 5)
      // This reduces the payload size and complexity for the initial request
      const simplifiedQuestions = questions.slice(0, 5);
      
      // Log the interview details
      console.log('Starting interview with details:', {
        interviewId,
        role: interview?.role || 'Software Developer',
        techstack: interview?.techstack || ['JavaScript', 'React'],
        level: interview?.level || 'Mid-level',
        questionsCount: simplifiedQuestions.length
      });
      
      // Start the interview using the VAPI integration
      const interviewResult = await startVapiInterview(
        userName || 'Candidate',
        userId || 'user-' + Date.now() + '',
        interviewId || '',
        interview?.role || 'Software Developer',
        interview?.techstack || ['JavaScript', 'React'],
        interview?.level || 'Mid-level',
        simplifiedQuestions, // Use simplified questions for initial request
        'interview'
      );
      
      if (!interviewResult.success) {
        console.error(`Failed to start VAPI interview: ${interviewResult.error}`);
        setState(prev => ({
          ...prev,
          error: `Failed to start interview: ${interviewResult.error || 'Unknown error'}`
        }));
        return null;
      }
      
      console.log('VAPI interview started successfully:', interviewResult);
      return interviewResult;
    } catch (error) {
      console.error("Error in handleExistingInterview:", error);
      // Set a more user-friendly error message
      setState(prev => ({
        ...prev,
        callStatus: CallStatus.ERROR,
        error: "Failed to start the interview. Please try again in a few moments."
      }));
      return null;
    }
  }, [userName, userId, interviewId, questions, setState]);

  // Handle feedback type
  const handleFeedback = useCallback(async () => {
    // Ensure feedbackId is available
    if (!feedbackId) {
      console.error("No feedback ID provided");
      setState(prev => ({
        ...prev,
        callStatus: CallStatus.INACTIVE,
        error: "No feedback ID available. Please try again."
      }));
      return null;
    }
    try {
      if (!questions || questions.length === 0) {
        console.error("No questions provided for feedback");
        setState(prev => ({
          ...prev,
          callStatus: CallStatus.INACTIVE,
          error: "No discussion points available for this feedback. Please try again."
        }));
        return null;
      }

      console.log("Starting feedback session with discussion points:", questions);
      
      // Log the feedback details
      console.log('Starting feedback session with details:', {
        interviewId,
        userId,
        questions
      });
      
      // Start the feedback session using the VAPI integration
      const feedbackResult = await startVapiInterview(
        userName || 'Candidate',
        userId || 'user-' + Date.now() + '',
        interviewId || '',
        'Software Developer', // Default role for feedback
        'General programming', // Default tech stack for feedback
        'Mid-level', // Default level for feedback
        questions,
        'feedback'
      );
      
      if (!feedbackResult.success) {
        throw new Error(`Failed to start VAPI feedback session: ${feedbackResult.error}`);
      }
      
      console.log('VAPI feedback session started successfully:', feedbackResult);
      return feedbackResult;
    } catch (error) {
      console.error("Error in handleFeedback:", error);
      throw error;
    }
  }, [userName, userId, interviewId, questions, resumeData, setState]);

  // Track if an interview start is in progress to prevent duplicate calls
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  // Track call status in localStorage to prevent duplicate requests across renders
  const checkCallStatus = useCallback((interviewId: string) => {
    if (typeof window === 'undefined') return false;
    
    try {
      const statusKey = `vapi_call_${interviewId}`;
      const status = localStorage.getItem(statusKey);
      vapiLogger.debug(`Checking VAPI call status for ${interviewId}`, { status });
      return status === 'in_progress' || status === 'active';
    } catch (error) {
      vapiLogger.warn('Error checking call status:', error);
      return false;
    }
  }, []);
  
  const setCallStatus = useCallback((interviewId: string, status: 'in_progress' | 'active' | 'completed' | 'failed') => {
    if (typeof window === 'undefined') return;
    
    try {
      const statusKey = `vapi_call_${interviewId}`;
      vapiLogger.debug(`Setting VAPI call status for ${interviewId} to ${status}`);
      
      if (status === 'in_progress' || status === 'active' || status === 'completed') {
        localStorage.setItem(statusKey, status);
      } else {
        localStorage.removeItem(statusKey);
      }
    } catch (error) {
      vapiLogger.error('Failed to set call status:', error);
    }
  }, []);
  
  // Main function to start the interview
  const startInterview = useCallback(async () => {
    try {
      // First check the current React state
      if (isStartingInterview || state.callStatus === CallStatus.CONNECTING || state.callStatus === CallStatus.ACTIVE) {
        console.log("Interview start already in progress or active, ignoring duplicate call");
        return;
      }
      
      // Check localStorage to see if there's an in-progress call for this interview
      // This helps prevent duplicate requests across page refreshes or component remounts
      if (interviewId && checkCallStatus(interviewId)) {
        vapiLogger.info(`VAPI call already in progress for interview ${interviewId}, connecting to existing call`);
        setState(prev => ({
          ...prev,
          callStatus: CallStatus.CONNECTING,
          error: null
        }));
        return;
      }
      
      // Set starting flag in both React state and localStorage
      setIsStartingInterview(true);
      if (interviewId) {
        setCallStatus(interviewId, 'in_progress');
      }
      
      // Update state to connecting
      setState(prev => ({
        ...prev,
        callStatus: CallStatus.CONNECTING,
        error: null
      }));
      
      let result;
      
      // Call the appropriate handler based on interview type
      if (type === "generate") {
        result = await handleGenerateInterview().catch(err => {
          vapiLogger.error("Error in generate interview:", err);
          return null;
        });
      } else if (type === "interview" && interviewId) {
        result = await handleExistingInterview().catch(err => {
          vapiLogger.error("Error in existing interview:", err);
          return null;
        });
      } else if (resumeData) {
        // Use resume data to generate interview
        result = await handleResumeInterview().catch(err => {
          vapiLogger.error("Error in resume interview:", err);
          return null;
        });
      } else if (feedbackId) {
        result = await handleFeedback().catch(err => {
          vapiLogger.error("Error in feedback:", err);
          return null;
        });
      } else {
        vapiLogger.error("Invalid interview configuration");
        setState(prev => ({
          ...prev,
          callStatus: CallStatus.ERROR,
          error: "Invalid interview configuration. Please try again."
        }));
        return null;
      }
      
      if (result) {
        setState(prev => ({ ...prev, callStatus: CallStatus.ACTIVE }));
        
        // Mark as active in localStorage
        if (interviewId) {
          setCallStatus(interviewId, 'active');
        }
      } else {
        setState(prev => ({
          ...prev,
          callStatus: CallStatus.INACTIVE,
          error: "Failed to start interview. Please try again later."
        }));
        
        // Mark as failed in localStorage
        if (interviewId) {
          setCallStatus(interviewId, 'failed');
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error starting interview:", error);
      setState(prev => ({
        ...prev,
        callStatus: CallStatus.INACTIVE,
        error: `Failed to start interview: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    } finally {
      setIsStartingInterview(false);
    }
  }, [
    // Fixed dependencies that actually affect the function
    type,
    interviewId,
    resumeData,
    feedbackId,
    handleGenerateInterview,
    handleExistingInterview,
    handleFeedback,
    handleResumeInterview,
    isStartingInterview,
    state.callStatus,
    checkCallStatus,
    setCallStatus,
    setState
  ]);

  return {
    ...state,
    startInterview,
    setCallStatus: (status: CallStatus) => setState(prev => ({ ...prev, callStatus: status })),
    setError: (error: string | null) => setState(prev => ({ ...prev, error }))
  };
}
