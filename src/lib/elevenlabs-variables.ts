/**
 * ElevenLabs Dynamic Variables Reference
 * 
 * This file contains all the dynamic variables that should be configured 
 * in your ElevenLabs agent and will be passed from the application at runtime.
 * 
 * Copy these variable names to your ElevenLabs agent configuration.
 */

/**
 * List of dynamic variables for ElevenLabs agent
 * These match exactly the {{variable_name}} placeholders in your ElevenLabs prompt
 */
export const ELEVENLABS_DYNAMIC_VARIABLES = [
  // Core variables used in your ElevenLabs prompt
  'candidateName',        // e.g., "John Doe" - used throughout prompt
  'role',                // e.g., "Senior Full Stack Developer" - used in introduction
  'experienceLevel',     // e.g., "Senior", "Mid", "Junior" - used in sections
  'yearsOfExperience',   // e.g., "7" (as string) - used in profile
  'techStack',           // e.g., "React, Node.js, TypeScript" - used in questions
  'interviewType',       // e.g., "Technical Interview" - used in profile
  'primaryTech',         // e.g., "React" - first tech from stack, used in questions
  
  // Additional useful variables (not in prompt but helpful)
  'interviewId',         // e.g., "interview_123" - for tracking
  'interviewDuration',   // e.g., "45" (minutes as string) - for context
  
  // Aliases for compatibility
  'username',            // alias for candidateName
  'user_name'            // another alias for candidateName
] as const;

/**
 * Example of how variables will be structured when passed to ElevenLabs
 * These match exactly what your ElevenLabs agent will receive
 */
export const EXAMPLE_ELEVENLABS_VARIABLES = {
  // Core variables used in your ElevenLabs prompt
  candidateName: "John Doe",
  role: "Senior Full Stack Developer", 
  experienceLevel: "Senior",
  yearsOfExperience: "7",
  techStack: "React, Node.js, TypeScript, PostgreSQL",
  interviewType: "Technical Interview",
  primaryTech: "React",
  
  // Additional useful variables (not in prompt but helpful)
  interviewId: "interview_123",
  interviewDuration: "45",
  
  // Aliases for compatibility
  username: "John Doe",
  user_name: "John Doe"
};

/**
 * Type definition for the variables object
 */
export type ElevenLabsVariables = typeof EXAMPLE_ELEVENLABS_VARIABLES;

/**
 * Instructions for setting up ElevenLabs agent:
 * 
 * 1. Configure your interview prompt in your ElevenLabs agent settings
 * 2. Use {{variable_name}} format in your prompt (ElevenLabs will replace these at runtime)
 * 3. The application will automatically pass these variables when starting the conversation
 * 4. All variables listed above should be configured as dynamic variables in ElevenLabs
 */
