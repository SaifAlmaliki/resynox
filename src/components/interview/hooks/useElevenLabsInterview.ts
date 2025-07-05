"use client";

import { useState, useCallback } from "react";
import { startElevenLabsInterview } from "@/lib/elevenlabs.integration";
import { createInterview, getInterviewById } from "@/lib/actions/interview.actions";
import { AgentType, CallStatus } from "@/types/interview";
import { elevenLabsLogger } from "@/lib/elevenlabs.logger";

// Define a type for resume data to avoid using 'any'
interface ResumeData {
  name?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  [key: string]: unknown; // Allow additional properties
}

interface UseElevenLabsInterviewProps {
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

export const useElevenLabsInterview = ({
  userName,
  userId = '',
  interviewId = '',
  type = 'interview',
  questions = [],
  resumeData,
  feedbackId
}: UseElevenLabsInterviewProps) => {
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
      // Use the provided questions if available, otherwise use default questions
      const interviewQuestions = questions.length > 0 ? questions : [
        "Tell me about your experience with JavaScript, React, and Node.js.",
        "What challenges have you faced as a Full Stack Developer?",
        "How do you stay updated with the latest trends in web development?",
        "Describe a project where you used modern web technologies.",
        "How do you handle tight deadlines and pressure situations?"
      ];

      const result = await createInterview({
        userId: userId!,
        role: "Full Stack Developer", // Default role - will be personalized if resume data exists
        level: "Mid-level", // Default level - will be personalized based on resume
        questions: interviewQuestions, // Use the provided questions or defaults
        techstack: ["JavaScript", "React", "Node.js"], // Default tech stack - will be personalized from resume
        type: "voice", // Changed from "technical" to "voice" to match the voice interview flow
        skipQuestionSelection: true, // Flag to skip question selection step
      });

      if (!result.success) {
        console.error("Failed to create interview record", result);
        setState(prev => ({
          ...prev,
          callStatus: CallStatus.INACTIVE,
          error: "Failed to create interview. Please try again."
        }));
        return null;
      }

      // Update state with the created interview data
      setState(prev => ({
        ...prev,
        createdInterviewId: result.interviewId || null,
        personalizedQuestions: result.questions || [],
        personalizedRole: result.role || 'Full Stack Developer',
        personalizedTechstack: result.techstack || ["JavaScript", "React", "Node.js"]
      }));
      
      // Start the interview using the ElevenLabs integration with the actual questions
      const interviewResult = await startElevenLabsInterview(
        userName || 'Candidate',
        userId || 'user-' + Date.now() + '',
        result.interviewId || '',
        result.role || 'Full Stack Developer',
        result.techstack || ["JavaScript", "React", "Node.js"],
        'Mid-level',
        result.questions || [], // Pass the actual questions from the database
        'generate'
      );
      
      if (!interviewResult.success) {
        throw new Error(`Failed to start ElevenLabs interview: ${interviewResult.error}`);
      }
      
      console.log('ElevenLabs interview started successfully:', interviewResult);
      return interviewResult;
    } catch (error) {
      console.error("Error in handleGenerateInterview:", error);
      throw error;
    }
  }, [userName, userId, questions]); // Add questions to dependencies

  // Main start interview function
  const startInterview = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        callStatus: CallStatus.INITIALIZING,
        error: null
      }));

      const result = await handleGenerateInterview();

      if (result && result.success) {
        setState(prev => ({
          ...prev,
          callStatus: CallStatus.ACTIVE,
          error: null
        }));
        elevenLabsLogger.info('Interview started successfully', { type, userName });
      } else {
        setState(prev => ({
          ...prev,
          callStatus: CallStatus.INACTIVE,
          error: result?.error || 'Failed to start interview'
        }));
        elevenLabsLogger.error('Failed to start interview', { type, userName, error: result?.error });
      }

      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        callStatus: CallStatus.INACTIVE,
        error: errorMessage
      }));
      elevenLabsLogger.error('Error starting interview', { error: errorMessage, type, userName });
      throw error;
    }
  }, [type, handleGenerateInterview, userName]);

  // Stop interview function
  const stopInterview = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        callStatus: CallStatus.INACTIVE,
        error: null
      }));
      elevenLabsLogger.info('Interview stopped', { userName });
    } catch (error: any) {
      elevenLabsLogger.error('Error stopping interview', { error: error?.message, userName });
    }
  }, [userName]);

  return {
    ...state,
    startInterview,
    stopInterview,
    isLoading: state.callStatus === CallStatus.INITIALIZING,
    isActive: state.callStatus === CallStatus.ACTIVE,
    isInactive: state.callStatus === CallStatus.INACTIVE
  };
}; 