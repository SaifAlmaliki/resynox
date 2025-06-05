"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVapiInterview } from "./hooks/useVapiInterview";
import { useVapiEvents } from "./hooks/useVapiEvents";
import { InterviewInterface } from "./ui/InterviewInterface";
import { createFeedback } from "@/lib/actions/interview.actions";
import { AgentProps, CallStatus, SavedMessage } from "@/types/interview";

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
  
  // Initialize the VAPI interview hook
  const {
    callStatus,
    error,
    createdInterviewId,
    personalizedRole,
    personalizedTechstack,
    startInterview,
    setCallStatus,
    setError
  } = useVapiInterview({
    userName,
    userId,
    interviewId,
    type,
    questions
  });
  
  // Handle generating feedback when the interview is complete
  const handleGenerateFeedback = useCallback(async (messages: SavedMessage[]) => {
    try {
      if (!interviewId && !createdInterviewId) {
        console.error("No interview ID available for feedback");
        setError("Failed to generate feedback. Missing interview ID.");
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
        setError("Failed to generate feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      setError("An error occurred while generating feedback.");
    }
  }, [interviewId, createdInterviewId, userId, feedbackId, personalizedRole, personalizedTechstack, role, techstack, level, router, setError]);
  
  // Initialize the VAPI events hook
  const {
    messages,
    isSpeaking,
    lastMessage,
    handleDisconnect
  } = useVapiEvents({
    callStatus,
    setCallStatus,
    setError,
    onCallFinished: handleGenerateFeedback
  });
  
  // Start the interview automatically when the component mounts
  useEffect(() => {
    if (callStatus === CallStatus.INACTIVE) {
      startInterview();
    }
  }, [callStatus, startInterview]);
  
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
