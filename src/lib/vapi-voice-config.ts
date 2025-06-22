/**
 * VAPI Voice Configuration for Natural Interview Conversations
 * This configuration prevents interruptions and creates more realistic dialogue
 */

export interface VapiVoiceConfig {
  voice: {
    provider: string;
    voiceId: string;
    model: string;
    speed: number;
    stability: number;
    style: number;
  };
  transcriber: {
    provider: string;
    model: string;
    language: string;
    endpointing: {
      end_of_speech_silence_threshold: number;
      utterance_end_ms: number;
      vad_threshold: number;
      min_utterance_length: number;
    };
    keywords: string[];
    punctuate: boolean;
    diarize: boolean;
    multichannel: boolean;
  };
  backgroundSound: string;
  backchannelingEnabled: boolean;
  backgroundDenoisingEnabled: boolean;
  modelOutputInMessagesEnabled: boolean;
}

/**
 * Optimized configuration to prevent interruptions during interviews
 */
export const INTERVIEW_VOICE_CONFIG: VapiVoiceConfig = {
  // Voice settings for natural, professional speech
  voice: {
    provider: "11labs",
    voiceId: "sarah", // Professional, clear female voice
    model: "eleven_turbo_v2", // Fast, high-quality voice synthesis
    speed: 0.9, // Slightly slower for better comprehension
    stability: 0.8, // High stability for consistent voice
    style: 0.2 // Neutral, professional tone
  },
  
  // Transcription settings optimized to prevent interruptions
  transcriber: {
    provider: "deepgram",
    model: "nova-2", // Latest, most accurate transcription model
    language: "en-US",
    
    // Critical: Voice Activity Detection settings
    endpointing: {
      // Wait 1.8 seconds of silence before responding (increased from default ~0.8s)
      end_of_speech_silence_threshold: 1800,
      
      // Allow up to 2.5 seconds for natural pauses within a single response
      utterance_end_ms: 2500,
      
      // More sensitive threshold to better detect when user is still speaking
      vad_threshold: 0.4,
      
      // Minimum 0.6 seconds before considering it actual speech (filters out "um", breathing)
      min_utterance_length: 600
    },
    
    // Keywords to improve transcription accuracy for interview context
    keywords: [
      "interview", "experience", "project", "team", "challenge", "solution",
      "development", "management", "leadership", "collaboration", "skills",
      "responsibility", "achievement", "problem", "result", "process"
    ],
    
    punctuate: true, // Better sentence structure
    diarize: false, // Single speaker detection
    multichannel: false // Single audio channel
  },
  
  // Audio environment settings
  backgroundSound: "off", // No background sounds that might trigger interruptions
  backchannelingEnabled: false, // Disable "mm-hmm" sounds that can interrupt candidates
  backgroundDenoisingEnabled: true, // Clean audio processing
  modelOutputInMessagesEnabled: true // Enable message tracking
};

/**
 * Alternative configuration for feedback sessions (even more patient)
 */
export const FEEDBACK_VOICE_CONFIG: VapiVoiceConfig = {
  ...INTERVIEW_VOICE_CONFIG,
  
  // Even more patient settings for feedback discussions
  transcriber: {
    ...INTERVIEW_VOICE_CONFIG.transcriber,
    endpointing: {
      end_of_speech_silence_threshold: 2200, // Wait 2.2 seconds (even longer)
      utterance_end_ms: 3000, // Allow 3 seconds for reflection pauses
      vad_threshold: 0.3, // More sensitive to detect quiet speaking
      min_utterance_length: 800 // Longer minimum to avoid interrupting "thinking sounds"
    }
  },
  
  voice: {
    ...INTERVIEW_VOICE_CONFIG.voice,
    speed: 0.85, // Slightly slower for feedback delivery
    style: 0.1 // Even more neutral for constructive feedback
  }
};

/**
 * Get the appropriate voice configuration based on interview type
 */
export function getVoiceConfig(type: 'interview' | 'feedback' = 'interview'): VapiVoiceConfig {
  return type === 'feedback' ? FEEDBACK_VOICE_CONFIG : INTERVIEW_VOICE_CONFIG;
}

/**
 * Merge voice configuration with other VAPI settings
 */
export function mergeVoiceConfig(
  baseConfig: any, 
  voiceConfig: VapiVoiceConfig
): any {
  return {
    ...baseConfig,
    ...voiceConfig,
    // Ensure existing properties are preserved
    variableValues: baseConfig.variableValues,
    recordingEnabled: baseConfig.recordingEnabled,
    model: baseConfig.model
  };
} 