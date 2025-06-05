"use client";

import { useEffect, useCallback, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { CallStatus, SavedMessage } from "@/types/interview";

interface UseVapiEventsProps {
  callStatus: CallStatus;
  setCallStatus: (status: CallStatus) => void;
  setError: (error: string | null) => void;
  maxReconnectAttempts?: number;
  onCallFinished?: (messages: SavedMessage[]) => void;
}

export function useVapiEvents({
  callStatus,
  setCallStatus,
  setError,
  maxReconnectAttempts = 3,
  onCallFinished
}: UseVapiEventsProps) {
  // State for tracking messages and reconnection attempts
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Handle call end
  const handleDisconnect = useCallback(async () => {
    setCallStatus(CallStatus.FINISHED);
    await vapi.stop();
  }, [setCallStatus]);

  // Set up event listeners for VAPI
  useEffect(() => {
    let cleanupFunctions: (() => void)[] = [];

    const setupVapiEvents = async () => {
      try {
        // Get the properly initialized VAPI client
        const vapiClient = await vapi.getClient();
        
        if (!vapiClient) {
          console.error("VAPI client not available");
          return;
        }

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
          } else {
            console.log("Max reconnect attempts reached. Ending call.");
            setCallStatus(CallStatus.FINISHED);
            setError("Connection lost. Please try again later.");
          }
        };

        // Handler for new messages
        const onMessage = (message: Record<string, any>) => {
          // Only log important messages to reduce console noise
          if (message.type && (
              message.type === 'conversation-update' || 
              message.type === 'call-status-update' || 
              message.type === 'error')) {
            console.log("VAPI important message:", message);
          }
          
          // Add the message to our state if it has role and content
          if (message.role && message.content) {
            setMessages(prev => [...prev, { role: message.role, content: message.content }]);
          }
          
          // If it's an assistant message, update the last message for display
          if (message.role === "assistant") {
            setLastMessage(message.content);
          }
        };

        // Handler for when the assistant is speaking
        const onSpeakStart = () => {
          setIsSpeaking(true);
        };

        // Handler for when the assistant stops speaking
        const onSpeakEnd = () => {
          setIsSpeaking(false);
        };

        // Handler for errors during the call
        const onError = (error: any) => {
          // Extract meaningful error information
          let errorMessage = "Unknown error occurred";
          
          if (error) {
            if (typeof error === 'string') {
              errorMessage = error;
            } else if (error.message) {
              errorMessage = error.message;
            } else if (error.error) {
              errorMessage = typeof error.error === 'string' ? error.error : error.error.message || "API error";
            } else if (error.status && error.statusText) {
              errorMessage = `HTTP ${error.status}: ${error.statusText}`;
            } else {
              try {
                const str = JSON.stringify(error);
                if (str && str !== '{}') {
                  errorMessage = `Error: ${str}`;
                } else {
                  errorMessage = "Empty error object - connection issue";
                }
              } catch (e) {
                errorMessage = "Error occurred but details unavailable";
              }
            }
          }
          
          console.error("VAPI error:", error);
          console.error("VAPI error message:", errorMessage);
          setError(`Error during call: ${errorMessage}`);
          setCallStatus(CallStatus.ERROR);
          setReconnectAttempts(maxReconnectAttempts); // Prevent reconnection attempts
        };

        // Set up the event listeners using the initialized client
        vapiClient.on("call-start", onCallStart);
        vapiClient.on("call-end", onCallEnd);
        vapiClient.on("message", onMessage);
        vapiClient.on("speak-start" as any, onSpeakStart);
        vapiClient.on("speak-end" as any, onSpeakEnd);
        vapiClient.on("error", onError);

        // Store cleanup functions
        cleanupFunctions = [
          () => vapiClient.off("call-start", onCallStart),
          () => vapiClient.off("call-end", onCallEnd),
          () => vapiClient.off("message", onMessage),
          () => vapiClient.off("speak-start" as any, onSpeakStart),
          () => vapiClient.off("speak-end" as any, onSpeakEnd),
          () => vapiClient.off("error", onError)
        ];

      } catch (error) {
        console.error("Failed to setup VAPI events:", error);
        setError("Failed to initialize voice connection");
      }
    };

    // Initialize VAPI events
    setupVapiEvents();

    // Clean up the event listeners when the component unmounts
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [reconnectAttempts, maxReconnectAttempts, setCallStatus, setError]);

  // Handle call completion
  useEffect(() => {
    // When the call is finished, call the onCallFinished callback with the messages
    if (callStatus === CallStatus.FINISHED && onCallFinished) {
      onCallFinished(messages);
    }
  }, [callStatus, messages, onCallFinished]);

  return {
    messages,
    isSpeaking,
    lastMessage,
    handleDisconnect
  };
}
