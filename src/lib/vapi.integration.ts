"use client";

import { AgentType } from "@/types/interview";
import { createTechnicalInterviewPrompt } from "./vapi-prompt-template";
import { vapiLogger } from "./vapi.logger";
import { vapi } from "./vapi.sdk";
import { mergeVoiceConfigWithOverrides } from "./vapi/voice-config";


// Get the pre-created assistant ID from environment variables
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';

// New comprehensive interface for technical interviews
export interface TechnicalInterviewParams {
  interviewId: string;
  candidateName: string;
  role: string;
  experienceLevel: string;
  techStack: string[];
  yearsOfExperience: number;
  interviewDuration: number; // in minutes
  interviewType: string;
  userId?: string;
}


export const startComprehensiveTechnicalInterview = async (
  params: TechnicalInterviewParams
): Promise<{ success: boolean; error?: string }> => {
  try {
    vapiLogger.info('Starting comprehensive technical interview', params);

    // Validate required environment variables
    if (!VAPI_ASSISTANT_ID) {
      vapiLogger.error('Missing VAPI_ASSISTANT_ID in environment variables');
      return { 
        success: false, 
        error: 'VAPI assistant not configured. Please check environment variables.'
      };
    }

    // Create the comprehensive system prompt
    const systemPrompt = createTechnicalInterviewPrompt({
      candidateName: params.candidateName,
      role: params.role,
      experienceLevel: params.experienceLevel,
      techStack: params.techStack,
      yearsOfExperience: params.yearsOfExperience,
      interviewDuration: params.interviewDuration,
      interviewType: params.interviewType
    });

    // VAPI Assistant Overrides with comprehensive variable mapping
    type VapiAssistantOverrides = {
      model?: {
        provider?: string;
        model?: string;
        messages?: Array<{
          role: string;
          content: string;
        }>;
      };
      variableValues?: Record<string, any>;
      recordingEnabled?: boolean;
      voice?: {
        provider: string;
        voiceId: string;
        model: string;
        speed: number;
        stability: number;
        similarity_boost: number;
        style: number;
        use_speaker_boost: boolean;
      };
      transcriber?: {
        provider: string;
        model: string;
        language: string;
        smart_format: boolean;
        endpointing?: {
          end_of_speech_silence_threshold: number;
          utterance_end_ms: number;
          vad_threshold: number;
          min_utterance_length: number;
        };
        keywords?: string[];
        punctuate: boolean;
        diarize: boolean;
        multichannel: boolean;
      };
      backgroundSound?: string;
      backchannelingEnabled?: boolean;
      backgroundDenoisingEnabled?: boolean;
      modelOutputInMessagesEnabled?: boolean;
      serverUrl?: string | null;
      serverUrlSecret?: string | null;
    };

    // Prepare comprehensive variables for VAPI
    const interviewVariables = {
      // Candidate Information
      candidateName: params.candidateName,
      role: params.role,
      experienceLevel: params.experienceLevel,
      yearsOfExperience: params.yearsOfExperience,
      techStack: Array.isArray(params.techStack) ? params.techStack.join(', ') : params.techStack,
      techStackArray: params.techStack,
      
      // Interview Configuration
      interviewDuration: params.interviewDuration,
      interviewType: params.interviewType,
      interviewId: params.interviewId,
      
      // Derived Variables for conditional logic
      isJunior: params.experienceLevel.toLowerCase().includes('junior'),
      isMid: params.experienceLevel.toLowerCase().includes('mid') || params.experienceLevel.toLowerCase().includes('middle'),
      isSenior: params.experienceLevel.toLowerCase().includes('senior'),
      
      // Time allocation (based on interview duration)
      introTime: Math.ceil(params.interviewDuration * 0.15), // 15% for intro
      technicalTime: Math.ceil(params.interviewDuration * 0.4), // 40% for technical
      codingTime: Math.ceil(params.interviewDuration * 0.3), // 30% for coding
      behavioralTime: Math.ceil(params.interviewDuration * 0.2), // 20% for behavioral
      wrapupTime: Math.ceil(params.interviewDuration * 0.05), // 5% for wrapup
      
      // For backwards compatibility with existing application
      username: params.candidateName,
      
      // First tech from stack for specific questions
      primaryTech: params.techStack[0] || 'JavaScript',
      
      // Experience categorization
      experienceCategory: params.yearsOfExperience < 2 ? 'Junior' : 
                         params.yearsOfExperience < 5 ? 'Mid' : 'Senior'
    };

    const assistantOverrides: VapiAssistantOverrides = {
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          }
        ]
      },
      variableValues: interviewVariables,
      recordingEnabled: true
    };

    // Apply optimized voice configuration to prevent interruptions
    const finalAssistantOverrides = mergeVoiceConfigWithOverrides(
      assistantOverrides,
      'interview'
    );

    console.log('VAPI comprehensive interview setup:', {
      assistantId: VAPI_ASSISTANT_ID,
      candidateName: params.candidateName,
      role: params.role,
      duration: `${params.interviewDuration} minutes`,
      techStack: params.techStack,
      variableCount: Object.keys(interviewVariables).length
    });

    // The improved VAPI client already handles retries and proper initialization
    // No need for additional retry logic here since vapi.start() now has built-in retry
    try {
      vapiLogger.info('Starting comprehensive technical interview with improved VAPI client', { 
        candidateName: params.candidateName, 
        role: params.role,
        duration: params.interviewDuration,
        techStackCount: params.techStack.length,
        assistantId: VAPI_ASSISTANT_ID
      });

      // Start the comprehensive technical interview
      // The improved vapi.start() method handles initialization, retries, and error handling
      await vapi.start(VAPI_ASSISTANT_ID, finalAssistantOverrides as any);
      
      vapiLogger.info('Successfully started comprehensive technical interview', {
        assistantId: VAPI_ASSISTANT_ID,
        candidateName: params.candidateName,
        role: params.role,
        duration: params.interviewDuration
      });

      return { success: true };

    } catch (error: any) {
      vapiLogger.error('Failed to start comprehensive technical interview after all retry attempts', { 
        error: error?.message || error,
        candidateName: params.candidateName,
        role: params.role,
        assistantId: VAPI_ASSISTANT_ID
      });
      
      return { 
        success: false, 
        error: `Interview failed to start: ${error?.message || 'Unable to connect to interview service'}` 
      };
    }

  } catch (error: any) {
    vapiLogger.error('Error in comprehensive technical interview setup', {
      error: error?.message || error,
      candidateName: params.candidateName,
      role: params.role
    });
    
    return { 
      success: false, 
      error: `Interview setup failed: ${error?.message || 'Unknown error'}` 
    };
  }
};

/**
 * BACKWARD COMPATIBILITY FUNCTION 
 * Uses the existing assistant ID with variable substitution (legacy approach)
 */
export const startVapiInterviewWithExistingAssistant = async (
  userName: string,
  userId: string,
  interviewId: string,
  role: string,
  techstack: string | string[],
  experienceLevel: string = "Mid-level",
  questions: string[] = [],
  type: AgentType = "interview"
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Convert to new comprehensive format
    const techStackArray = Array.isArray(techstack) ? techstack : [techstack];
    
    // Use the comprehensive interview function with converted parameters
    return await startComprehensiveTechnicalInterview({
      interviewId,
      candidateName: userName,
      role,
      experienceLevel,
      techStack: techStackArray,
      yearsOfExperience: experienceLevel.toLowerCase().includes('junior') ? 1 : 
                        experienceLevel.toLowerCase().includes('senior') ? 7 : 3,
      interviewDuration: 15, // default duration
      interviewType: type,
      userId
    });
  } catch (error: any) {
    vapiLogger.error('Error in startVapiInterviewWithExistingAssistant', { error });
    return { 
      success: false, 
      error: `Legacy interview setup failed: ${error?.message || 'Unknown error'}` 
    };
  }
};

// Keep the original function for backward compatibility
export const startVapiInterview = async (
  userName: string,
  userId: string,
  interviewId: string,
  role: string,
  techstack: string | string[],
  experienceLevel: string = "Mid-level",
  questions: string[] = [],
  type: AgentType = "interview"
): Promise<{ success: boolean; error?: string }> => {
  // Use the new approach with existing assistant
  return startVapiInterviewWithExistingAssistant(
    userName,
    userId,
    interviewId,
    role,
    techstack,
    experienceLevel,
    questions,
    type
  );
};