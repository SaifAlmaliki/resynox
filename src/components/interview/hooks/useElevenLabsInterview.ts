"use client";

import { useState, useCallback, useRef } from "react";
import { createInterview, getInterviewById } from "@/lib/actions/interview.actions";
import { AgentType, CallStatus } from "@/types/interview";
import ElevenLabsVoiceAgent, { 
  TechnicalInterviewParams, 
  VoiceAgentCallbacks,
  startElevenLabsTechnicalInterview 
} from "@/lib/elevenlabs-voice-agent";

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
  isSpeaking: boolean;
  lastMessage: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
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
    personalizedRole: '',
    personalizedTechstack: [],
    isSpeaking: false,
    lastMessage: '',
    messages: []
  });

  // Ref to hold the voice agent instance
  const voiceAgentRef = useRef<ElevenLabsVoiceAgent | null>(null);

  // Update state helper
  const updateState = useCallback((updates: Partial<InterviewState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Voice agent callbacks
  const voiceCallbacks: VoiceAgentCallbacks = {
    onStatusChange: (status) => {
      console.log('🔄 Voice agent status changed:', status);
      
      let callStatus: CallStatus;
      switch (status) {
        case 'connecting':
          callStatus = CallStatus.CONNECTING;
          break;
        case 'connected':
        case 'speaking':
        case 'listening':
          callStatus = CallStatus.ACTIVE;
          break;
        case 'disconnected':
          callStatus = CallStatus.FINISHED;
          break;
        case 'error':
          callStatus = CallStatus.ERROR;
          break;
        default:
          callStatus = CallStatus.INACTIVE;
      }

      updateState({ 
        callStatus,
        isSpeaking: status === 'speaking'
      });
    },

    onMessage: (message) => {
      console.log('💬 New message:', message);
      updateState(prev => ({
        messages: [...prev.messages, message],
        lastMessage: message.role === 'assistant' ? message.content : prev.lastMessage
      }));
    },

    onError: (error) => {
      console.error('❌ Voice agent error:', error);
      updateState({ 
        error,
        callStatus: CallStatus.ERROR
      });
    },

    onTranscript: (transcript, isFinal) => {
      console.log('📝 Transcript:', { transcript, isFinal });
      // You can add real-time transcript handling here if needed
    }
  };

  // Start interview function
  const startInterview = useCallback(async (interviewParams: {
    role: string;
    experienceLevel: string;
    techStack: string[];
    yearsOfExperience: number;
    interviewDuration: number;
    interviewType: string;
  }) => {
    try {
      updateState({ 
        callStatus: CallStatus.CONNECTING,
        error: null,
        messages: []
      });

      console.log('🚀 Starting ElevenLabs interview with params:', interviewParams);

      // Create interview record in database
      let finalInterviewId = interviewId;
      if (!finalInterviewId) {
        try {
          const newInterview = await createInterview({
            userId: userId || '',
            type: type,
            questions: questions,
            status: 'in_progress'
          });
          finalInterviewId = newInterview.id;
          updateState({ createdInterviewId: finalInterviewId });
        } catch (dbError) {
          console.error('❌ Failed to create interview record:', dbError);
          // Continue with interview even if DB creation fails
        }
      }

      // Prepare technical interview parameters
      const technicalParams: TechnicalInterviewParams = {
        interviewId: finalInterviewId || `temp_${Date.now()}`,
        candidateName: userName,
        role: interviewParams.role,
        experienceLevel: interviewParams.experienceLevel,
        techStack: interviewParams.techStack,
        yearsOfExperience: interviewParams.yearsOfExperience,
        interviewDuration: interviewParams.interviewDuration,
        interviewType: interviewParams.interviewType,
        userId: userId
      };

      // Start the ElevenLabs voice interview
      const result = await startElevenLabsTechnicalInterview(technicalParams, voiceCallbacks);

      if (result.success && result.agent) {
        voiceAgentRef.current = result.agent;
        console.log('✅ ElevenLabs interview started successfully');
        
        // Store personalized data for display
        updateState({
          personalizedRole: interviewParams.role,
          personalizedTechstack: interviewParams.techStack,
          personalizedQuestions: questions
        });
      } else {
        throw new Error(result.error || 'Failed to start voice interview');
      }

    } catch (error: any) {
      console.error('❌ Failed to start interview:', error);
      updateState({ 
        error: error.message || 'Failed to start interview',
        callStatus: CallStatus.ERROR
      });
    }
  }, [userName, userId, interviewId, type, questions, voiceCallbacks, updateState]);

  // End interview function
  const endInterview = useCallback(async () => {
    try {
      console.log('🛑 Ending ElevenLabs interview...');
      
      if (voiceAgentRef.current) {
        await voiceAgentRef.current.endConversation();
        voiceAgentRef.current = null;
      }

      updateState({ 
        callStatus: CallStatus.FINISHED
      });

      // Update interview status in database
      if (state.createdInterviewId || interviewId) {
        try {
          // You can add interview completion logic here
          console.log('📝 Interview completed, updating database...');
        } catch (dbError) {
          console.error('❌ Failed to update interview status:', dbError);
        }
      }

    } catch (error: any) {
      console.error('❌ Error ending interview:', error);
      updateState({ 
        error: error.message || 'Error ending interview'
      });
    }
  }, [state.createdInterviewId, interviewId, updateState]);

  // Get interview data function
  const getInterviewData = useCallback(async (id: string) => {
    try {
      const interview = await getInterviewById(id);
      return interview;
    } catch (error: any) {
      console.error('❌ Failed to get interview data:', error);
      updateState({ 
        error: error.message || 'Failed to get interview data'
      });
      return null;
    }
  }, [updateState]);

  // Send message function (if needed for manual input)
  const sendMessage = useCallback(async (message: string) => {
    try {
      if (voiceAgentRef.current && voiceAgentRef.current.isActive()) {
        await voiceAgentRef.current.sendMessage(message);
      }
    } catch (error: any) {
      console.error('❌ Failed to send message:', error);
      updateState({ 
        error: error.message || 'Failed to send message'
      });
    }
  }, [updateState]);

  return {
    // State
    callStatus: state.callStatus,
    error: state.error,
    createdInterviewId: state.createdInterviewId,
    personalizedQuestions: state.personalizedQuestions,
    personalizedRole: state.personalizedRole,
    personalizedTechstack: state.personalizedTechstack,
    isSpeaking: state.isSpeaking,
    lastMessage: state.lastMessage,
    messages: state.messages,

    // Actions
    startInterview,
    endInterview,
    getInterviewData,
    sendMessage,

    // Utilities
    isActive: voiceAgentRef.current?.isActive() || false,
    voiceAgent: voiceAgentRef.current
  };
};
