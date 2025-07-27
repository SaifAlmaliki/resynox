"use client";

import { useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useElevenLabsInterview } from "./hooks/useElevenLabsInterview";
import { InterviewInterface } from "./ui/InterviewInterface";
import { createFeedback } from "@/lib/actions/interview.actions";
import { AgentProps, CallStatus } from "@/types/interview";
import { useInterviewSession } from "./hooks/useInterviewSession";


export const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,

  role,
  level,
  techstack
}: AgentProps) => {
  const router = useRouter();
  
  // Ref to prevent double interview starts
  const hasStartedRef = useRef(false);
  
  // Use enhanced session management
  const sessionManager = useInterviewSession({
    interviewId: interviewId || 'generated',
    userId: userId || 'anonymous',
    maxReconnectAttempts: 3,
    sessionTimeout: 30 * 60 * 1000 // 30 minutes
  });

  // Initialize the ElevenLabs interview hook 
  const {
    callStatus,
    error,
    messages,
    isSpeaking,
    startInterview,
    endInterview
  } = useElevenLabsInterview({
    userName,
    type
  });

  // Track interview state for feedback generation
  const createdInterviewId = interviewId; // Use provided interview ID
  const personalizedRole = role;
  const personalizedTechstack = useMemo(() => techstack || [], [techstack]);

  // Enhanced error handling
  useEffect(() => {
    if (error) {
      console.error('ElevenLabs interview error:', error);
      // Simple error logging without session manager for now
    }
  }, [error]);

  // Enhanced connection status management
  useEffect(() => {
    if (callStatus === CallStatus.CONNECTING) {
      sessionManager.updateStatus(CallStatus.CONNECTING);
    } else if (callStatus === CallStatus.ACTIVE) {
      sessionManager.updateStatus(CallStatus.ACTIVE);
    }
  }, [callStatus, sessionManager]);
  
  // Handle generating feedback when the interview is complete
  const handleGenerateFeedback = useCallback(async (rawMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>) => {
    try {
      if (!interviewId && !createdInterviewId) {
        console.error("No interview ID available for feedback");
        console.error("Failed to generate feedback. Missing interview ID.");
        return;
      }
      
      const targetInterviewId = interviewId || createdInterviewId;
      
      // Convert messages to the expected format for createFeedback
      const transcript = rawMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user', // Ensure role compatibility
        content: msg.content
      }));
      
      // Create the feedback
      const result = await createFeedback({
        interviewId: targetInterviewId!,
        userId: userId!,
        transcript: transcript,
        feedbackId,
        additionalContext: {
          role: personalizedRole || role,
          techstack: personalizedTechstack.length > 0 ? personalizedTechstack : techstack,
          level
        }
      });
      
      if (result.success) {
        // Redirect to the feedback page
        router.push(`/interview/${targetInterviewId}/feedback`);
      } else {
        console.error("Failed to create feedback");
        console.error("Failed to generate feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      console.error("An error occurred while generating feedback.");
    }
  }, [interviewId, createdInterviewId, userId, feedbackId, personalizedRole, personalizedTechstack, role, techstack, level, router]);
  
  // Start the interview automatically when the component mounts (only once)
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      console.log('🎬 Starting interview (single instance)');
      
      startInterview({
        candidateName: userName || "User",
        role: role || "Developer",
        experienceLevel: level || "Mid",
        techStack: techstack || [],
        yearsOfExperience: 3, // Default value
        interviewDuration: 30, // Default 30 minutes
        interviewType: "Technical Interview"
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Handle navigation when call is finished
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        if (createdInterviewId) {
          // If we created a new interview, redirect to its feedback page
          console.log("Redirecting to feedback page for interview:", createdInterviewId);
          router.push(`/interview/${createdInterviewId}/feedback`);
        } else {
          // Fallback if no interview was created
          router.push("/interview");
        }
      } else if (interviewId) {
        // For existing interviews, generate feedback
        handleGenerateFeedback(messages);
      } else {
        // Fallback if something went wrong
        router.push("/interview");
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId, createdInterviewId, handleGenerateFeedback]);
  
  return (
    <InterviewInterface
      callStatus={callStatus}
      error={error}
      messages={messages}
      isSpeaking={isSpeaking}
      lastMessage={messages[messages.length - 1]?.content || ''}
      onDisconnect={endInterview}
    />
  );
};

// Default export for the Agent component
export default Agent;
