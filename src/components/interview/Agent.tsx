"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useElevenLabsInterview } from "./hooks/useElevenLabsInterview";

import { InterviewInterface } from "./ui/InterviewInterface";
import { createFeedback } from "@/lib/actions/interview.actions";
import { AgentProps, CallStatus, SavedMessage } from "@/types/interview";
import { useInterviewSession } from "./hooks/useInterviewSession";
import { elevenLabsLogger } from "@/lib/elevenlabs.logger";
import { interviewAnalytics } from "@/lib/interview-analytics";

export const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions = [],
  role,
  level,
  techstack
}: AgentProps) => {
  const router = useRouter();
  
  // Use enhanced session management
  const sessionManager = useInterviewSession({
    interviewId: interviewId || 'generated',
    userId: userId || 'anonymous',
    maxReconnectAttempts: 3,
    sessionTimeout: 30 * 60 * 1000 // 30 minutes
  });

  // Initialize performance monitoring
  useEffect(() => {
    elevenLabsLogger.info('ElevenLabs session started');

    return () => {
      // Cleanup on unmount
      elevenLabsLogger.info('ElevenLabs session ended');
    };
  }, []);
  
  // Initialize the ElevenLabs interview hook 
  const {
    callStatus,
    error,
    createdInterviewId,
    personalizedRole,
    personalizedTechstack,
    startInterview,
    stopInterview
  } = useElevenLabsInterview({
    userName,
    userId,
    interviewId,
    type,
    questions
  });

  // Enhanced error handling
  useEffect(() => {
    if (error) {
      elevenLabsLogger.error('Interview error', {
        error,
        interviewId,
        userId,
        type
      });
      // Log error for debugging
      console.error('Interview error:', error);
    }
  }, [error, interviewId, userId, type, sessionManager]);

  // Enhanced connection status management
  useEffect(() => {
    if (callStatus === CallStatus.CONNECTING) {
      sessionManager.updateStatus(CallStatus.CONNECTING);
      elevenLabsLogger.info('ElevenLabs connection starting');
    } else if (callStatus === CallStatus.ACTIVE) {
      sessionManager.updateStatus(CallStatus.ACTIVE);
      elevenLabsLogger.info('ElevenLabs connection active');
    }
  }, [callStatus, sessionManager]);
  
  // Handle generating feedback when the interview is complete
  const handleGenerateFeedback = useCallback(async (messages: SavedMessage[]) => {
    try {
      if (!interviewId && !createdInterviewId) {
        console.error("No interview ID available for feedback");
        return;
      }
      
      const targetInterviewId = interviewId || createdInterviewId;
      
      // Create the feedback
      const result = await createFeedback({
        interviewId: targetInterviewId!,
        userId: userId!,
        transcript: messages,
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
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
    }
  }, [interviewId, createdInterviewId, userId, feedbackId, personalizedRole, personalizedTechstack, role, techstack, level, router]);
  
  // Temporary state for messages and speaking status
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  
  // Handle disconnect
  const handleDisconnect = useCallback(async () => {
    await stopInterview();
  }, [stopInterview]);
  
  // Start the interview automatically when the component mounts (only once)
  useEffect(() => {
    if (callStatus === CallStatus.INACTIVE && !error) {
      const timer = setTimeout(() => {
        startInterview();
      }, 1000); // Add a small delay to prevent immediate restart
      
      return () => clearTimeout(timer);
    }
  }, []); // Remove dependencies to prevent infinite loop
  
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
      lastMessage={lastMessage}
      onDisconnect={handleDisconnect}
    />
  );
};

// Default export for the Agent component
export default Agent;
