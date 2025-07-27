"use client";

import { Conversation } from '@elevenlabs/client';

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

export interface VoiceAgentCallbacks {
  onStatusChange?: (status: 'connecting' | 'connected' | 'speaking' | 'listening' | 'disconnected' | 'error') => void;
  onMessage?: (message: { role: 'user' | 'assistant'; content: string; timestamp: Date }) => void;
  onError?: (error: string) => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
}

class ElevenLabsVoiceAgent {
  private conversation: any = null;
  private callbacks: VoiceAgentCallbacks = {};
  private isConnected = false;
  private currentStatus: 'connecting' | 'connected' | 'speaking' | 'listening' | 'disconnected' | 'error' = 'disconnected';

  constructor(callbacks: VoiceAgentCallbacks = {}) {
    this.callbacks = callbacks;
  }

  private updateStatus(status: typeof this.currentStatus) {
    this.currentStatus = status;
    this.callbacks.onStatusChange?.(status);
  }

  private handleError(error: string) {
    console.error('ElevenLabs Voice Agent Error:', error);
    this.updateStatus('error');
    this.callbacks.onError?.(error);
  }

  private handleMessage(role: 'user' | 'assistant', content: string) {
    const message = {
      role,
      content,
      timestamp: new Date()
    };
    this.callbacks.onMessage?.(message);
  }

  /**
   * Prepare dynamic variables for ElevenLabs agent
   * These variables match exactly the {{variable_name}} placeholders in your ElevenLabs prompt
   */
  private prepareDynamicVariables(params: TechnicalInterviewParams): Record<string, string> {
    // Extract primary tech from tech stack for focused questions
    const primaryTech = Array.isArray(params.techStack) && params.techStack.length > 0 
      ? params.techStack[0] 
      : 'JavaScript';
    
    const variables = {
      // Core variables matching exactly your ElevenLabs prompt placeholders
      candidateName: params.candidateName,
      role: params.role,
      experienceLevel: params.experienceLevel,
      yearsOfExperience: params.yearsOfExperience.toString(),
      techStack: Array.isArray(params.techStack) ? params.techStack.join(', ') : params.techStack,
      interviewType: params.interviewType,
      primaryTech: primaryTech
    };

    // Enhanced logging for debugging dynamic variables
    console.log('\n🔧 ===== ELEVENLABS DYNAMIC VARIABLES PREPARATION =====');
    console.log('🎯 Variables matching your ElevenLabs prompt placeholders:');
    console.log('📊 Total variables count:', Object.keys(variables).length);
    console.log('📝 Variables being sent to ElevenLabs:');
    
    // Log each variable individually for clarity
    Object.entries(variables).forEach(([key, value]) => {
      console.log(`  • ${key}: "${value}"`);
    });
    
    console.log('\n📋 Full variables object:');
    console.log(JSON.stringify(variables, null, 2));
    console.log('🔧 ===== END DYNAMIC VARIABLES =====\n');

    return variables;
  }

  async startConversation(params: TechnicalInterviewParams): Promise<{ success: boolean; error?: string }> {
    try {
      this.updateStatus('connecting');

      // Check for required environment variables
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        const error = 'ElevenLabs Agent ID is missing. Please set NEXT_PUBLIC_ELEVENLABS_AGENT_ID in your environment variables.';
        this.handleError(error);
        return { success: false, error };
      }

      // Request microphone access
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        const errorMessage = 'Microphone access denied. Please allow microphone access to start the voice interview.';
        this.handleError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Prepare dynamic variables for ElevenLabs
      const dynamicVariables = this.prepareDynamicVariables(params);

      console.log('🚀 Starting ElevenLabs conversation with variables:', {
        agentId,
        candidateName: params.candidateName,
        role: params.role,
        duration: `${params.interviewDuration} minutes`,
        techStack: params.techStack,
        variableCount: Object.keys(dynamicVariables).length,
        variables: dynamicVariables
      });

      // Log the dynamic variables being passed to ElevenLabs
      console.log('🔧 Dynamic Variables being passed to ElevenLabs:');
      console.log('📋 Agent ID:', agentId);
      console.log('📝 Dynamic Variables:', JSON.stringify(dynamicVariables, null, 2));
      console.log('📊 Total variables count:', Object.keys(dynamicVariables || {}).length);
      
      // Start the conversation with ElevenLabs
      this.conversation = await Conversation.startSession({
        agentId: agentId,
        dynamicVariables: dynamicVariables,

        // ElevenLabs conversation callbacks (using proper SDK callback names)
        onConnect: () => {
          console.log('✅ Connected to ElevenLabs voice agent');
          console.log('🎉 Dynamic variables successfully sent to ElevenLabs!');
          console.log('🎯 All prompt placeholders are now populated:');
          Object.keys(dynamicVariables).forEach(key => {
            console.log(`  • {{${key}}} = "${dynamicVariables[key]}"`);
          });
          console.log('📝 Your ElevenLabs prompt should now have all variables replaced!');
          this.isConnected = true;
          this.updateStatus('connected');
        },

        onDisconnect: () => {
          console.log('🔌 Disconnected from ElevenLabs voice agent');
          this.isConnected = false;
          this.updateStatus('disconnected');
        },

        onError: (error: any) => {
          console.error('❌ ElevenLabs conversation error:', error);
          const errorMessage = error?.message || error || 'Unknown error';
          this.handleError(`Conversation error: ${errorMessage}`);
        },

        onMessage: (message: any) => {
          console.log('💬 Message received:', message);
          // Handle different message types based on ElevenLabs SDK
          if (message.type === 'agent_response' || message.role === 'assistant') {
            this.updateStatus('speaking');
            this.handleMessage('assistant', message.text || message.content || '');
          } else if (message.type === 'user_transcript' || message.role === 'user') {
            this.handleMessage('user', message.text || message.content || '');
          }
        },

        onStatusChange: (status: any) => {
          console.log('🔄 Status changed:', status);
          const statusValue = status?.status || status;
          switch (statusValue) {
            case 'connected':
            case 'ready':
              this.updateStatus('connected');
              break;
            case 'speaking':
            case 'agent_speaking':
              this.updateStatus('speaking');
              break;
            case 'listening':
            case 'user_speaking':
              this.updateStatus('listening');
              break;
            case 'disconnected':
            case 'ended':
              this.updateStatus('disconnected');
              break;
            default:
              console.log('Unknown status:', statusValue);
          }
        }
      } as any); // Use 'as any' to bypass TypeScript issues with ElevenLabs SDK types

      return { success: true };

    } catch (error: unknown) {
      console.error('❌ Failed to start ElevenLabs conversation:', error);
      const errorMessage = `Failed to start voice interview: ${error instanceof Error ? error.message : String(error)}`;
      this.handleError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async endConversation(): Promise<void> {
    try {
      if (this.conversation && this.isConnected) {
        console.log('🛑 Ending ElevenLabs conversation...');
        await this.conversation.endSession();
        this.isConnected = false;
        this.updateStatus('disconnected');
      }
    } catch (error: unknown) {
      console.error('❌ Error ending conversation:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.handleError(`Error ending conversation: ${errorMessage}`);
    }
  }

  getStatus(): typeof this.currentStatus {
    return this.currentStatus;
  }

  isActive(): boolean {
    return this.isConnected && (this.currentStatus === 'connected' || this.currentStatus === 'speaking' || this.currentStatus === 'listening');
  }
}

export default ElevenLabsVoiceAgent;

/**
 * Convenience function to start a technical interview with ElevenLabs
 */
export const startElevenLabsTechnicalInterview = async (
  params: TechnicalInterviewParams,
  callbacks: VoiceAgentCallbacks = {}
): Promise<{ success: boolean; error?: string; agent?: ElevenLabsVoiceAgent }> => {
  try {
    const agent = new ElevenLabsVoiceAgent(callbacks);
    const result = await agent.startConversation(params);
    
    if (result.success) {
      return { success: true, agent };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: unknown) {
    console.error('❌ Failed to initialize ElevenLabs voice agent:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      error: `Failed to initialize voice agent: ${errorMessage}` 
    };
  }
};
