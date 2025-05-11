"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback, createInterview } from "@/lib/actions/interview.actions";
import { AgentProps, CallStatus, SavedMessage } from "@/types/interview";
import { Button } from "@/components/ui/button";

const Agent = ({userName, userId, interviewId, feedbackId, type, questions}: AgentProps) => {
  const router = useRouter();
  
  // State management
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  // State for error handling and reconnection
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 3;
  
  // State to track the created interview data
  const [createdInterviewId, setCreatedInterviewId] = useState<string | null>(null);
  const [personalizedQuestions, setPersonalizedQuestions] = useState<string[]>([]);
  const [personalizedRole, setPersonalizedRole] = useState<string>("");
  const [personalizedTechstack, setPersonalizedTechstack] = useState<string[]>([]);

  // Set up event listeners for voice API interactions
  useEffect(() => {
    // Handler for when call begins
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setError(null); // Clear any previous errors
    };

    // Handler for when call ends
    const onCallEnd = () => {
      // Only set to finished if we're not trying to reconnect
      if (reconnectAttempts < maxReconnectAttempts) {
        console.log(`Call ended unexpectedly. Reconnect attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
        setReconnectAttempts(prev => prev + 1);
        // Try to reconnect after a short delay
        setTimeout(() => {
          if (type === "generate") {
            // @ts-expect-error - Type issues with VAPI client
            vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
              variableValues: {
                username: userName,
                userid: userId,
              },
            }).catch((err: Error) => {
              console.error("Failed to reconnect:", err);
              setCallStatus(CallStatus.FINISHED);
              setError("Connection lost. Please try again.");
            });
          }
        }, 2000);
      } else {
        console.log("Max reconnect attempts reached. Ending call.");
        setCallStatus(CallStatus.FINISHED);
        setError("Connection lost. Please try again later.");
      }
    };

    // Define a type for VAPI messages
    interface VapiMessage {
      type: string;
      transcriptType?: string;
      role?: string;
      transcript?: string;
    }

    // Handler for receiving messages (transcripts)
    const onMessage = (message: VapiMessage) => {
      // Only process final transcripts, not interim ones
      if (message.type === "transcript" && message.transcriptType === "final" && message.role && message.transcript) {
        // Convert VAPI role to SavedMessage role
        const role = message.role === "user" ? "user" : 
                    message.role === "system" ? "system" : "assistant";
        
        const newMessage: SavedMessage = { 
          role: role, 
          content: message.transcript 
        };
        
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    // Handler for when AI starts speaking
    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    // Handler for when AI stops speaking
    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    // Error handler
    const onError = (error: Error) => {
      console.error("VAPI Error:", error);
      
      // Check for Daily.co ejection error
      if (error.message?.includes("Meeting ended due to ejection")) {
        setError("The interview connection was lost. This may be due to network issues or service availability.");
        // Don't try to reconnect for ejection errors as they're usually permanent
        setCallStatus(CallStatus.FINISHED);
        setReconnectAttempts(maxReconnectAttempts); // Prevent auto-reconnect
      } else {
        setError(`Error: ${error.message || "Unknown error occurred"}`);
      }
    };

    // Listen for global window errors that might be related to Daily.co
    const handleWindowError = (event: ErrorEvent) => {
      if (event.message?.includes("daily") || event.message?.includes("WebSocket")) {
        console.error("Window error related to Daily.co:", event);
        setError("Connection error detected. The interview may not function correctly.");
      }
    };

    // Register all event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    window.addEventListener("error", handleWindowError);

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      window.removeEventListener("error", handleWindowError);
    };
  }, [reconnectAttempts, maxReconnectAttempts, type, userName, userId]);
 
  // Handle message updates and call completion
  useEffect(() => {
    // Update the last message for display whenever messages change
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    // Function to generate and save feedback from the interview transcript
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      if (!interviewId || !userId) {
        console.error("Missing interviewId or userId");
        router.push("/");
        return;
      }

      // Call API to create feedback record in the database
      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId,
        userId: userId,
        transcript: messages,
        feedbackId,
      });

      // Navigate based on API response
      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    // Handle navigation when call is finished
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
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId, createdInterviewId]);

  /**
   * Start the interview call
   */
  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);

      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.error("Not in browser environment");
        setCallStatus(CallStatus.INACTIVE);
        return;
      }

      if (type === "generate") {
        // Create a new interview record in the database with personalized data from resume
        // We'll use default values that will be overridden by resume data in the createInterview function
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
          setCallStatus(CallStatus.INACTIVE);
          setError("Failed to create interview. Please try again.");
          return;
        }

        // Save the created interview data for later use
        if (result.interviewId) {
          setCreatedInterviewId(result.interviewId);
          console.log("Created new interview with ID:", result.interviewId);
          
          // Store personalized data if available
          if (result.questions && result.questions.length > 0) {
            setPersonalizedQuestions(result.questions);
            console.log("Starting interview with personalized questions:", result.questions);
          }
          
          if (result.role) {
            setPersonalizedRole(result.role);
            console.log("Using personalized role from resume:", result.role);
          }
          
          if (result.techstack && result.techstack.length > 0) {
            setPersonalizedTechstack(result.techstack);
            console.log("Using personalized tech stack from resume:", result.techstack);
          }
        }

        // Format personalized questions for the VAPI workflow
        const formattedQuestions = personalizedQuestions.length > 0 
          ? personalizedQuestions.map(q => `- ${q}`).join('\n')
          : '';

        // Start the interview directly with personalized data from resume
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
            interviewId: result.interviewId,
            role: personalizedRole || 'Full Stack Developer',
            techstack: personalizedTechstack.join(', ') || 'JavaScript, React, Node.js',
            questions: formattedQuestions, // Pass personalized questions directly
            skipIntro: true, // Skip the introduction/selection step
          },
          clientMessages: [],
          serverMessages: [],
        });
      } else if (type === "interview") {
        // For interview type with pre-generated questions
        let formattedQuestions = "";
        if (questions && questions.length > 0) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
          console.log("Starting interview with pre-generated questions:", formattedQuestions);
        } else {
          console.error("No questions provided for interview");
          setError("No questions available for this interview. Please try again.");
          setCallStatus(CallStatus.INACTIVE);
          return;
        }

        // Start the interview with the pre-generated questions
        await vapi.start(interviewer, {
          variableValues: {
            username: userName,
            userid: userId,
            questions: formattedQuestions,
            interviewId: interviewId,
            skipIntro: true, // Skip the introduction step
          },
          clientMessages: [],
          serverMessages: [],
        });
      } else {
        // For feedback type or any other type
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        // Start the interview with the formatted questions
        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
            interviewId: interviewId, // Use the provided interview ID
          },
          clientMessages: [],
          serverMessages: [],
        });
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      setCallStatus(CallStatus.INACTIVE);
      setError(`Failed to start interview: ${error instanceof Error ? error.message : 'Unknown error'}`); 
    }
  };

  /**
   * End the active call
   */
  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="flex flex-col space-y-8 w-full max-w-6xl mx-auto">
      {/* Error message display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
          {reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts && (
            <p className="mt-2 text-sm">
              Attempting to reconnect... ({reconnectAttempts}/{maxReconnectAttempts})
            </p>
          )}
          {callStatus === CallStatus.FINISHED && (
            <div className="mt-3">
              <Button 
                onClick={() => {
                  setError(null);
                  setReconnectAttempts(0);
                  setCallStatus(CallStatus.INACTIVE);
                  setMessages([]);
                }}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Interview generation layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Interviewer Card - Left column */}
        <div className="bg-card rounded-lg p-6 border shadow-sm flex flex-col items-center">
          <div className="relative mb-4">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
            {isSpeaking && (
              <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full animate-pulse" />
            )}
            {callStatus === CallStatus.CONNECTING && (
              <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-blue-400" />
            )}
          </div>
          <h3 className="text-xl font-semibold">AI Interviewer</h3>
        </div>

        {/* Transcript display - Middle column */}
        <div className="bg-card rounded-lg border shadow-sm flex flex-col md:col-span-1">
          <div className="p-6 flex-1 overflow-auto min-h-[200px]">
            {messages.length > 0 ? (
              <div className="space-y-4">
                <p
                  key={lastMessage}
                  className={cn(
                    "transition-opacity duration-500",
                    "animate-fadeIn"
                  )}
                >
                  {lastMessage}
                </p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-center">
                  {callStatus === CallStatus.INACTIVE
                    ? "Start the interview to begin"
                    : callStatus === CallStatus.CONNECTING
                    ? "Connecting..."
                    : reconnectAttempts > 0
                    ? "Reconnecting..."
                    : "No messages yet"}
                </p>
              </div>
            )}
          </div>
          <div className="p-4 border-t bg-muted/50 text-sm text-muted-foreground">
            {callStatus === CallStatus.INACTIVE && "Ready to start your interview"}
            {callStatus === CallStatus.CONNECTING && reconnectAttempts === 0 && "Connecting to AI interviewer..."}
            {callStatus === CallStatus.CONNECTING && reconnectAttempts > 0 && `Reconnecting (Attempt ${reconnectAttempts}/${maxReconnectAttempts})...`}
            {callStatus === CallStatus.ACTIVE && "Interview in progress"}
            {callStatus === CallStatus.FINISHED && !error && "Interview completed"}
            {callStatus === CallStatus.FINISHED && error && "Interview ended due to an error"}
          </div>
        </div>

        {/* User Card - Right column */}
        <div className="bg-card rounded-lg p-6 border shadow-sm flex flex-col items-center">
          <div className="relative mb-4">
            {/* User avatar - either use image or fallback to initials */}
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">
                {userName?.charAt(0) || "U"}
              </span>
            </div>
          </div>
          <h3 className="text-xl font-semibold">{userName || "User"}</h3>
        </div>
      </div>

      {/* Call controls */}
      <div className="flex justify-center">
        {callStatus === CallStatus.INACTIVE && (
          <Button 
            size="lg"
            onClick={handleCall}
            className="bg-green-600 hover:bg-green-700 px-8"
            disabled={reconnectAttempts >= maxReconnectAttempts}
          >
            Start Interview
          </Button>
        )}

        {(callStatus === CallStatus.CONNECTING || callStatus === CallStatus.ACTIVE) && (
          <Button 
            size="lg"
            onClick={handleDisconnect}
            variant="destructive"
            className="px-8"
          >
            End Interview
          </Button>
        )}

        {callStatus === CallStatus.FINISHED && error && (
          <Button 
            size="lg"
            onClick={() => {
              setError(null);
              setReconnectAttempts(0);
              setCallStatus(CallStatus.INACTIVE);
              setMessages([]);
            }}
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            Restart Interview
          </Button>
        )}
      </div>
    </div>
  );
};

export default Agent;
