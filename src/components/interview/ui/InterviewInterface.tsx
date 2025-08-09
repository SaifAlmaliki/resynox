"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { CallStatus, SavedMessage } from "@/types/interview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";


interface InterviewInterfaceProps {
  callStatus: CallStatus;
  error: string | null;
  messages: SavedMessage[];
  isSpeaking: boolean;
  lastMessage: string;
  onDisconnect: () => void;
}

export function InterviewInterface({
  callStatus,
  error,
  messages,
  isSpeaking,
  lastMessage,
  onDisconnect
}: InterviewInterfaceProps) {
  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6">

      {/* Error message display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <Card className="border-muted/50 shadow-sm">
        <CardContent className="p-0">
          {/* AI Status */}
          <div className="bg-muted/40 px-4 py-3 md:px-6 md:py-4 flex items-center">
            <div className="relative w-10 h-10 mr-3">
              <Image
                src="/ai-avatar.jpg"
                alt="AI Interviewer"
                fill
                className="rounded-full object-cover"
              />
              {isSpeaking && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <div>
              <p className="font-medium">AI Interviewer</p>
              <p className="text-sm text-muted-foreground">
                {callStatus === CallStatus.CONNECTING && "Connecting..."}
                {callStatus === CallStatus.ACTIVE && (isSpeaking ? "Speaking..." : "Listening...")}
                {callStatus === CallStatus.FINISHED && "Interview completed"}
                {callStatus === CallStatus.ERROR && "Connection error"}
              </p>
            </div>
            {callStatus === CallStatus.ACTIVE && (
              <Button 
                variant="outline" 
                className="ml-auto" 
                onClick={onDisconnect}
              >
                End Interview
              </Button>
            )}
          </div>

          {/* Body */}
          <div className="p-4 md:p-6">
            {/* Conversation history */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "p-4 rounded-lg max-w-[80%]",
                    message.role === "assistant" 
                      ? "bg-primary text-primary-foreground mr-auto" 
                      : "bg-muted ml-auto"
                  )}
                >
                  <p>{message.content}</p>
                </div>
              ))}

              {/* Show typing indicator when AI is speaking */}
              {isSpeaking && lastMessage && (
                <div className="bg-primary text-primary-foreground p-4 rounded-lg max-w-[80%] mr-auto">
                  <p>{lastMessage}</p>
                </div>
              )}
            </div>

            {/* Connection status */}
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground">
                {callStatus === CallStatus.INACTIVE && (
                  <p>Preparing to start interview...</p>
                )}
                {callStatus === CallStatus.CONNECTING && (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <p>Connecting to interview service...</p>
                  </div>
                )}
                {callStatus === CallStatus.ACTIVE && (
                  <p>Interview in progress. Speak clearly into your microphone.</p>
                )}
                {callStatus === CallStatus.FINISHED && (
                  <p>Interview completed. Generating feedback...</p>
                )}
                {callStatus === CallStatus.ERROR && (
                  <p className="text-red-500">
                    Error connecting to interview service. Please check your internet connection and try again.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Default export for the InterviewInterface component
export default InterviewInterface;
