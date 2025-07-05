"use client";

import { AgentType } from "@/types/interview";
import { createTechnicalInterviewPrompt } from "./elevenlabs-prompt-template";
import { elevenLabsLogger } from "./elevenlabs.logger";
import { elevenlabs } from "./elevenlabs.sdk";

// Get the pre-created agent ID from environment variables
const ELEVENLABS_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';

// Interface for technical interviews (migrated from VAPI)
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
  questions?: string[]; // Add questions parameter
}

export const startComprehensiveTechnicalInterview = async (
  params: TechnicalInterviewParams
): Promise<{ success: boolean; error?: string }> => {
  try {
    elevenLabsLogger.info('Starting comprehensive technical interview with ElevenLabs', {
      candidateName: params.candidateName,
      role: params.role,
      duration: params.interviewDuration,
      techStack: params.techStack,
      questionsCount: params.questions?.length || 0,
      agentId: ELEVENLABS_AGENT_ID
    });

    // Generate the interview prompt with all the context including questions
    const systemPrompt = createTechnicalInterviewPrompt({
      candidateName: params.candidateName,
      role: params.role,
      experienceLevel: params.experienceLevel,
      techStack: params.techStack,
      yearsOfExperience: params.yearsOfExperience,
      interviewDuration: params.interviewDuration,
      interviewType: params.interviewType,
      questions: params.questions // Pass the questions to the prompt
    });

    // Create interview variables for context
    const interviewVariables = {
      candidateName: params.candidateName,
      role: params.role,
      experienceLevel: params.experienceLevel,
      techStack: params.techStack.join(', '),
      yearsOfExperience: params.yearsOfExperience.toString(),
      interviewDuration: params.interviewDuration.toString(),
      interviewType: params.interviewType,
      userId: params.userId || '',
      questions: params.questions || [], // Include questions in variables
      questionsCount: (params.questions?.length || 0).toString()
    };

    console.log('ElevenLabs comprehensive interview setup:', {
      agentId: ELEVENLABS_AGENT_ID,
      candidateName: params.candidateName,
      role: params.role,
      duration: `${params.interviewDuration} minutes`,
      techStack: params.techStack,
      questionsCount: params.questions?.length || 0,
      questions: params.questions ? params.questions.slice(0, 5).map((q, i) => `${i+1}. ${q}`) : [],
      variableCount: Object.keys(interviewVariables).length
    });

    // Also log the questions being sent to the agent
    if (params.questions && params.questions.length > 0) {
      console.log('📝 First 5 questions being sent to ElevenLabs agent:');
      params.questions.slice(0, 5).forEach((question, index) => {
        console.log(`   ${index + 1}. ${question}`);
      });
      console.log(`   ... and ${params.questions.length - 5} more questions`);
    }

    // Start the comprehensive technical interview
    try {
      elevenLabsLogger.info('Starting comprehensive technical interview with ElevenLabs client', { 
        candidateName: params.candidateName, 
        role: params.role,
        duration: params.interviewDuration,
        techStackCount: params.techStack.length,
        agentId: ELEVENLABS_AGENT_ID
      });

      // Validate agent ID
      if (!ELEVENLABS_AGENT_ID) {
        throw new Error('ElevenLabs Agent ID is not configured. Please set NEXT_PUBLIC_ELEVENLABS_AGENT_ID environment variable.');
      }
      
      // Start the ElevenLabs conversation
      await elevenlabs.start(ELEVENLABS_AGENT_ID, {
        // Pass context variables to the conversation
        variables: interviewVariables,
        // Pass conversation config if needed
        conversationConfig: {
          // Add any specific ElevenLabs configuration
        },
        // Additional configuration options
        onConnect: () => {
          elevenLabsLogger.info('ElevenLabs conversation connected successfully');
        },
        onDisconnect: () => {
          elevenLabsLogger.info('ElevenLabs conversation disconnected');
        },
        onError: (error: any) => {
          elevenLabsLogger.error('ElevenLabs conversation error', { error });
        },
        onMessage: (message: any) => {
          // Log specific message types for debugging
          if (message.type === 'audio') {
            console.log("🎵 Audio message received");
          } else if (message.type !== 'ping') {
            console.log("📨 ElevenLabs message:", message.type);
          }
        }
      });
      
      elevenLabsLogger.info('Successfully started comprehensive technical interview', {
        agentId: ELEVENLABS_AGENT_ID,
        candidateName: params.candidateName,
        role: params.role,
        duration: params.interviewDuration
      });

      return { success: true };

    } catch (error: any) {
      elevenLabsLogger.error('Failed to start comprehensive technical interview after all retry attempts', { 
        error: error?.message || error,
        candidateName: params.candidateName,
        role: params.role,
        agentId: ELEVENLABS_AGENT_ID
      });
      
      return { 
        success: false, 
        error: `Interview failed to start: ${error?.message || 'Unable to connect to interview service'}` 
      };
    }

  } catch (error: any) {
    elevenLabsLogger.error('Error in comprehensive technical interview setup', {
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
 * Uses the existing agent ID with variable substitution (legacy approach)
 */
export const startElevenLabsInterviewWithExistingAgent = async (
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
      userId,
      questions: questions // Pass questions to the new function
    });
  } catch (error: any) {
    elevenLabsLogger.error('Error in startElevenLabsInterviewWithExistingAgent', { error });
    return { 
      success: false, 
      error: `Legacy interview setup failed: ${error?.message || 'Unknown error'}` 
    };
  }
};

// Main function for backward compatibility (replaces VAPI startInterview)
export const startElevenLabsInterview = async (
  userName: string,
  userId: string,
  interviewId: string,
  role: string,
  techstack: string | string[],
  experienceLevel: string = "Mid-level",
  questions: string[] = [],
  type: AgentType = "interview"
): Promise<{ success: boolean; error?: string }> => {
  // Use the new approach with existing agent
  return startElevenLabsInterviewWithExistingAgent(
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