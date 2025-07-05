"use client";

// Note: We're using a different approach since @elevenlabs/client 
// may not have the Conversation class we need for browser environments
// We'll use WebSocket connection directly for now

let conversationInstance: any | null = null;
let isInitializing = false;

// Helper function to extract meaningful error information
const extractErrorInfo = (error: any): string => {
  if (!error) return "Unknown error";
  
  // If it's a string, return it
  if (typeof error === 'string') return error;
  
  // If it has a message property
  if (error.message) return error.message;
  
  // If it's a Response object (fetch error)
  if (error.status && error.statusText) {
    return `HTTP ${error.status}: ${error.statusText}`;
  }
  
  // If it has error property
  if (error.error) {
    if (typeof error.error === 'string') return error.error;
    if (error.error.message) return error.error.message;
  }
  
  // Check for ElevenLabs-specific error formats
  if (error.code && error.details) {
    return `ElevenLabs Error ${error.code}: ${error.details}`;
  }
  
  // Try to stringify if it's an object
  try {
    const str = JSON.stringify(error);
    if (str && str !== '{}') return str;
    
    // If we get an empty object, provide more context
    if (str === '{}') {
      return "Empty error object - this may indicate an ElevenLabs initialization or permission issue. Check browser console for more details.";
    }
  } catch (e) {
    // Stringify failed
  }
  
  // Check if it's a TypeError or other native error
  if (error.name && error.message) {
    return `${error.name}: ${error.message}`;
  }
  
  // Last resort
  return error.toString ? error.toString() : "Unknown error occurred";
};

// Helper function to get signed URL for private agents
const getSignedUrl = async (agentId: string): Promise<string> => {
  try {
    const response = await fetch(`/api/elevenlabs/signed-url?agent_id=${agentId}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Got signed URL for ElevenLabs agent");
      return data.signed_url;
    } else {
      console.log("ℹ️ Failed to get signed URL, using public agent connection");
      return `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`;
    }
  } catch (error) {
    console.log("ℹ️ Error getting signed URL, using public agent connection:", error);
    return `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`;
  }
};

// Enhanced ElevenLabs client that ensures proper initialization
export const elevenlabs = {
  // Initialize and start conversation with retry mechanism
  async start(agentId: string, overrides?: any) {
    console.log("🎯 Starting ElevenLabs conversation with proper initialization...");
    
    // First, check if we have the required environment variables
    const elevenLabsAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    if (!elevenLabsAgentId) {
      const errorMsg = "ElevenLabs Agent ID is missing. Please check that NEXT_PUBLIC_ELEVENLABS_AGENT_ID is set in your environment variables.";
      console.error("❌", errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!agentId) {
      const errorMsg = "Agent ID parameter is missing.";
      console.error("❌", errorMsg);
      throw new Error(errorMsg);
    }
    
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      console.log("❌ ElevenLabs client not available - not in browser environment");
      throw new Error("ElevenLabs client not available in server environment");
    }

    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Microphone access granted");
    } catch (error) {
      console.error("❌ Microphone access denied:", error);
      throw new Error("Microphone access is required for voice conversations");
    }
    
    // Retry mechanism for the first-call issue
    let lastError: any = null;
    let errorDetails: string[] = [];
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📞 Attempt ${attempt} to start ElevenLabs conversation...`);
        
        // Create WebSocket connection to ElevenLabs
        const wsUrl = await getSignedUrl(agentId);
        console.log("🔗 Connecting to ElevenLabs WebSocket:", wsUrl);
        
        const websocket = new WebSocket(wsUrl);
        
        // Wait for connection to open with proper promise handling
        await new Promise((resolve, reject) => {
          const connectionTimeout = setTimeout(() => {
            websocket.close();
            reject(new Error("WebSocket connection timeout after 10 seconds"));
          }, 10000);
          
          websocket.onopen = () => {
            clearTimeout(connectionTimeout);
            console.log("✅ ElevenLabs WebSocket connected successfully");
            resolve(websocket);
          };
          
          websocket.onerror = (error) => {
            clearTimeout(connectionTimeout);
            console.error("❌ WebSocket connection failed:", error);
            reject(new Error(`WebSocket connection failed: ${error}`));
          };
          
          websocket.onclose = (event) => {
            clearTimeout(connectionTimeout);
            console.log("🔌 WebSocket closed during connection:", event.code, event.reason);
            if (event.code !== 1000) { // 1000 is normal closure
              reject(new Error(`WebSocket closed unexpectedly: ${event.code} ${event.reason}`));
            }
          };
        });
        
        // Track agent speaking state
        let agentIsSpeaking = false;
        let lastAgentAudioTime = 0;
        
        // Create a conversation wrapper object
        const conversation = {
          websocket,
          audioContext: null as AudioContext | null,
          mediaRecorder: null as MediaRecorder | null,
          microphoneStream: null as MediaStream | null,
          audioProcessor: null as ScriptProcessorNode | null,
          endSession: () => {
            console.log("🛑 Ending ElevenLabs session...");
            if (conversation.mediaRecorder && conversation.mediaRecorder.state !== 'inactive') {
              conversation.mediaRecorder.stop();
            }
            if (conversation.microphoneStream) {
              conversation.microphoneStream.getTracks().forEach(track => track.stop());
            }
            if (conversation.audioProcessor) {
              conversation.audioProcessor.disconnect();
            }
            websocket.close();
          }
        };
        
        // Initialize audio context for audio playback
        const initializeAudioContext = async () => {
          try {
            conversation.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (conversation.audioContext.state === 'suspended') {
              await conversation.audioContext.resume();
            }
            console.log("🔊 Audio context initialized successfully");
          } catch (error) {
            console.error("Failed to initialize audio context:", error);
          }
        };
        
        // Initialize microphone recording
        const initializeMicrophone = async () => {
          try {
            conversation.microphoneStream = await navigator.mediaDevices.getUserMedia({ 
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 16000, // Match ElevenLabs expected format
                channelCount: 1 // Mono
              }
            });
            
            // Create audio context for processing microphone input
            if (!conversation.audioContext) {
              await initializeAudioContext();
            }
            
            if (!conversation.audioContext) {
              console.error("Audio context not available for microphone");
              return;
            }
            
            // Create media stream source
            const source = conversation.audioContext.createMediaStreamSource(conversation.microphoneStream);
            
            // Create script processor for real-time audio processing
            const bufferSize = 4096; // Process in chunks
            const processor = conversation.audioContext.createScriptProcessor(bufferSize, 1, 1);
            
            processor.onaudioprocess = (event) => {
              if (websocket.readyState === WebSocket.OPEN) {
                const inputBuffer = event.inputBuffer;
                const inputData = inputBuffer.getChannelData(0); // Get mono channel
                
                // Calculate audio level (RMS) for voice activity detection
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                  sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                const audioLevel = rms * 100; // Convert to percentage
                
                // Check if agent has finished speaking (no audio for 1 second)
                const now = Date.now();
                const timeSinceLastAgentAudio = now - lastAgentAudioTime;
                agentIsSpeaking = timeSinceLastAgentAudio < 1000; // Agent considered speaking if audio within last 1000ms
                
                // Only send audio if there's actual sound AND agent is not speaking
                const silenceThreshold = 0.005; // Lowered threshold to catch more audio
                if (rms > silenceThreshold && !agentIsSpeaking) {
                  // Convert float32 audio data to 16-bit PCM
                  const pcmData = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    // Convert from float32 (-1.0 to 1.0) to 16-bit signed integer
                    const sample = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                  }
                  
                  // Convert to base64 for transmission
                  const bytes = new Uint8Array(pcmData.buffer);
                  const base64Audio = btoa(String.fromCharCode(...bytes));
                  
                  // Send to ElevenLabs using the correct format
                  const audioMessage = {
                    user_audio_chunk: base64Audio
                  };
                  
                  try {
                    websocket.send(JSON.stringify(audioMessage));
                  } catch (error) {
                    console.error("Failed to send audio chunk:", error);
                  }
                  
                  // Debug: Log audio chunk being sent (only occasionally to avoid spam)
                  if (Math.random() < 0.05) { // 5% chance to log
                    console.log(`🎤 Sent audio chunk to ElevenLabs: ${base64Audio.length} bytes, level: ${audioLevel.toFixed(2)}%`);
                    
                    // Additional debugging: Check if we have actual audio data
                    const sampleValues = Array.from(pcmData.slice(0, 10)).map(v => v.toString()).join(', ');
                    console.log(`🔍 Audio sample values: [${sampleValues}...]`);
                  }
                } else {
                  // Debug: Log why we're not sending audio
                  if (Math.random() < 0.01) { // 1% chance to log
                    if (agentIsSpeaking) {
                      console.log(`🤐 Agent speaking, blocking user audio (level: ${audioLevel.toFixed(2)}%)`);
                    } else {
                      console.log(`🔇 Silence detected, not sending audio (level: ${audioLevel.toFixed(2)}%)`);
                    }
                  }
                }
              }
            };
            
            // Connect the audio processing chain
            source.connect(processor);
            processor.connect(conversation.audioContext.destination);
            
            // Store processor for cleanup
            conversation.audioProcessor = processor;
            
            console.log("🎤 Microphone initialized with PCM processing");
            
            // Test audio processing after a short delay
            setTimeout(() => {
              console.log("🔍 Testing microphone audio processing...");
              console.log("🔍 Audio context state:", conversation.audioContext?.state);
              console.log("🔍 Microphone stream active:", conversation.microphoneStream?.active);
              console.log("🔍 Microphone tracks:", conversation.microphoneStream?.getTracks().map(t => ({
                kind: t.kind,
                enabled: t.enabled,
                readyState: t.readyState
              })));
            }, 2000);
          } catch (error) {
            console.error("Failed to initialize microphone:", error);
          }
        };
        
        // Function to play audio from base64 data
        const playAudio = async (audioData: string) => {
          try {
            if (!conversation.audioContext) {
              await initializeAudioContext();
            }
            
            if (!conversation.audioContext) {
              console.error("Audio context not available");
              return;
            }
            
            // ElevenLabs sends PCM audio data (raw audio samples)
            // Convert base64 to raw PCM data
            try {
              const binaryString = atob(audioData);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              // ElevenLabs typically sends 16-bit PCM at 16kHz or 22kHz
              // Convert bytes to 16-bit signed integers
              const samples = new Int16Array(bytes.buffer);
              
              // Create audio buffer for the PCM data
              // Assume mono channel and 16kHz sample rate (adjust if needed)
              const sampleRate = 16000;
              const numberOfChannels = 1;
              const audioBuffer = conversation.audioContext.createBuffer(
                numberOfChannels,
                samples.length,
                sampleRate
              );
              
              // Convert 16-bit PCM to float32 and copy to audio buffer
              const channelData = audioBuffer.getChannelData(0);
              for (let i = 0; i < samples.length; i++) {
                // Convert from 16-bit signed integer to float32 (-1.0 to 1.0)
                channelData[i] = samples[i] / 32768.0;
              }
              
              // Create audio source and play
              const source = conversation.audioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(conversation.audioContext.destination);
              source.start();
              
              console.log(`✅ Successfully played PCM audio chunk (${samples.length} samples, ${sampleRate}Hz)`);
              return;
            } catch (pcmError) {
              console.error("PCM audio processing failed:", pcmError);
              
              // Fallback: Try different sample rates for PCM
              try {
                const binaryString = atob(audioData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                
                const samples = new Int16Array(bytes.buffer);
                const sampleRates = [22050, 24000, 44100, 48000]; // Try different sample rates
                
                for (const sampleRate of sampleRates) {
                  try {
                    const audioBuffer = conversation.audioContext.createBuffer(1, samples.length, sampleRate);
                    const channelData = audioBuffer.getChannelData(0);
                    
                    for (let i = 0; i < samples.length; i++) {
                      channelData[i] = samples[i] / 32768.0;
                    }
                    
                    const source = conversation.audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(conversation.audioContext.destination);
                    source.start();
                    
                    console.log(`✅ Successfully played PCM audio with ${sampleRate}Hz sample rate`);
                    return;
                  } catch (e) {
                    console.log(`Failed with ${sampleRate}Hz sample rate:`, e);
                  }
                }
              } catch (fallbackError) {
                console.error("All PCM fallback methods failed:", fallbackError);
              }
            }
            
            console.error("❌ All audio playback methods failed");
          } catch (error) {
            console.error("Failed to play audio:", error);
          }
        };
        
        // Set up ongoing WebSocket event handlers
        websocket.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("📩 ElevenLabs message received:", message);
            
            // Handle different message types
            if (message.type === 'audio' && message.audio_event) {
              // Play audio if available
              if (message.audio_event.audio_base_64) {
                console.log("🎵 Received audio event:", {
                  type: message.type,
                  audioLength: message.audio_event.audio_base_64.length,
                  audioStart: message.audio_event.audio_base_64.substring(0, 50) + "...",
                  hasAudioData: !!message.audio_event.audio_base_64
                });
                
                // Update agent speaking tracking
                lastAgentAudioTime = Date.now();
                console.log("🤖 Agent is speaking - pausing user audio input");
                
                await playAudio(message.audio_event.audio_base_64);
              }
            } else if (message.type === 'conversation_initiation_metadata') {
              console.log("🎤 Conversation initiated, ready for audio");
              console.log("📊 Audio format info:", message.conversation_initiation_metadata_event);
              // Initialize audio context on first message
              await initializeAudioContext();
              // Initialize microphone after conversation is ready
              await initializeMicrophone();
            } else if (message.type === 'user_transcript') {
              console.log("🗣️ User transcript received:", message);
            } else if (message.type === 'agent_response') {
              console.log("🤖 Agent response received:", message);
            } else if (message.type === 'vad_score') {
              console.log("🎙️ Voice Activity Detection score:", message.vad_score_event?.vad_score);
            } else if (message.type === 'ping') {
              // Handle ping events (keep-alive) - no logging needed to avoid spam
              // But let's log occasionally to see if we're getting any other message types
              if (Math.random() < 0.01) {
                console.log("📡 Ping received - connection active");
              }
            } else {
              console.log("📩 Unknown message type:", message.type, message);
            }
            
            if (overrides?.onMessage) overrides.onMessage(message);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };
        
        websocket.onclose = () => {
          console.log("🔌 ElevenLabs conversation disconnected");
          conversationInstance = null;
          if (overrides?.onDisconnect) overrides.onDisconnect();
        };
        
        websocket.onerror = (error: any) => {
          console.error("❌ ElevenLabs conversation error:", error);
          if (overrides?.onError) overrides.onError(error);
        };
        
        // Send initial connection message with proper configuration
        websocket.send(JSON.stringify({
          type: "conversation_initiation_client_data",
          conversation_config_override: overrides?.conversationConfig || {},
          // Add audio configuration to ensure proper audio processing
          audio_config: {
            input_audio_format: "pcm_16000",
            output_audio_format: "pcm_16000"
          }
        }));
        
        // Send context and questions if provided
        if (overrides?.variables) {
          setTimeout(() => {
            if (websocket.readyState === WebSocket.OPEN) {
              websocket.send(JSON.stringify({
                type: "conversation_context",
                context: overrides.variables
              }));
              console.log("📤 Sent conversation context:", overrides.variables);
            }
          }, 1000); // Send after initial connection
        }

        // Test: Send a text message to see if the agent responds
        setTimeout(() => {
          if (websocket.readyState === WebSocket.OPEN) {
            console.log("🧪 Testing agent with text message...");
            websocket.send(JSON.stringify({
              type: "user_message",
              text: "Hello, can you hear me? Please respond if you can process text messages."
            }));
          }
        }, 3000); // Send after conversation is established
        
        if (overrides?.onConnect) overrides.onConnect();
        
        conversationInstance = conversation;
        console.log("✅ ElevenLabs conversation started successfully!");
        return conversation; // Success!
        
      } catch (error: any) {
        lastError = error;
        const errorMsg = extractErrorInfo(error);
        errorDetails.push(`Attempt ${attempt}: ${errorMsg}`);
        
        console.warn(`⚠️ Attempt ${attempt} failed: ${errorMsg}`);
        console.warn(`⚠️ Full error object:`, error);
        
        // If it's not the last attempt, wait before retrying
        if (attempt < 3) {
          console.log(`⏳ Waiting 1 second before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // If all attempts failed, throw a comprehensive error
    const finalErrorMsg = `All ElevenLabs conversation attempts failed. Details: ${errorDetails.join('; ')}`;
    console.error("❌", finalErrorMsg);
    console.error("❌ Last error object:", lastError);
    
    // Create a clear error to throw with troubleshooting info
    const troubleshootingInfo = `
Troubleshooting:
1. Check that NEXT_PUBLIC_ELEVENLABS_AGENT_ID is set correctly
2. Verify your ElevenLabs account has sufficient credits
3. Check browser console for additional error details
4. Try refreshing the page and trying again
5. Ensure microphone permissions are granted
    `;
    
    const finalError = new Error(finalErrorMsg + troubleshootingInfo);
    (finalError as any).originalError = lastError;
    throw finalError;
  },

  // Get the current conversation instance
  async getClient(): Promise<any> {
    if (!conversationInstance) {
      throw new Error("No active ElevenLabs conversation. Please start a conversation first.");
    }
    return conversationInstance;
  },

  // Direct access methods for common operations
  async stop() {
    if (conversationInstance) {
      console.log("🛑 Stopping ElevenLabs conversation...");
      await conversationInstance.endSession();
      conversationInstance = null;
      console.log("✅ ElevenLabs conversation stopped");
    }
  },

  async send(message: any) {
    const client = await this.getClient();
    return client.send(message);
  },

  async setVolume(volume: number) {
    const client = await this.getClient();
    return client.setVolume({ volume });
  },

  // Check if conversation is active
  isActive(): boolean {
    return conversationInstance !== null;
  },

  // Get conversation ID if available
  getId(): string | null {
    if (conversationInstance && conversationInstance.getId) {
      return conversationInstance.getId();
    }
    return null;
  }
}; 