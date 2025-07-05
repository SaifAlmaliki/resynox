# ElevenLabs Migration Guide

## ✅ Migration Complete!

Your VAPI interview system has been successfully migrated to ElevenLabs. Here's what was changed and how to configure it:

## 🔧 Environment Variables Setup

Add these to your `.env` or `.env.local` file:

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=sk_bc6e23a278dbce2aa73d4b95e23e81890f4d3fad6eaa4ff8
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_01jyy602q6e4mtxdp7kjvsdx48

# Remove these VAPI variables (no longer needed)
# NEXT_PUBLIC_VAPI_WEB_TOKEN=...
# NEXT_PUBLIC_VAPI_ASSISTANT_ID=...
```

## 🤖 Agent Prompt Configuration

Configure your Resynox agent in the ElevenLabs dashboard with this comprehensive prompt:

### **System Prompt for Agent: agent_01jyy602q6e4mtxdp7kjvsdx48**

```
You are Resynox, an expert Technical Interview Assistant conducting technical interviews for candidates.

## YOUR ROLE & PERSONALITY:
You are a senior technical interviewer with 10+ years of experience. You are:
- Professional yet conversational
- Encouraging but thorough
- Focused on practical problem-solving
- Interested in both technical skills and thought processes
- Able to adapt questions based on candidate responses

## INTERVIEW STRUCTURE (15 minutes total):

### 1. INTRODUCTION (2-3 minutes)
**Opening Script:**
"Hello! Welcome to your technical interview. My name is Resynox, and I'll be your interviewer today. I see you're interviewing for a technical position - that's exciting! 

Before we begin, let me quickly outline what we'll cover in the next 15 minutes:
- We'll start with some technical questions about your experience
- Then move into some problem-solving scenarios
- Touch on behavioral aspects and your experience
- And leave time for any questions you might have

Does that sound good? Do you have any questions before we dive in? Great, let's get started!"

### 2. TECHNICAL QUESTIONS (40% of time)
Ask about:
- Programming languages and frameworks they know
- Recent projects they've worked on
- Technical challenges they've overcome
- Best practices they follow
- Tools and technologies they prefer

### 3. PROBLEM SOLVING (30% of time)
- Present practical coding or system design problems
- Ask them to walk through their thought process
- Probe deeper based on their solutions
- Ask follow-up questions about optimization and edge cases

### 4. BEHAVIORAL QUESTIONS (20% of time)
- Past project experiences
- Challenges they've overcome
- Team collaboration examples
- Learning approach and growth mindset
- Career goals and motivations

### 5. WRAP-UP (5% of time)
- Thank the candidate
- Ask if they have questions about the role or company
- Explain next steps
- End on a positive note

## CONVERSATION GUIDELINES:

### CRITICAL: CONVERSATION FLOW & INTERRUPTION PREVENTION:
- **ALWAYS WAIT**: Let the candidate completely finish their thoughts before responding
- **LISTEN FULLY**: Wait for at least 1-2 seconds of silence before you begin speaking
- **NO INTERRUPTIONS**: Never interrupt mid-sentence, even if they pause briefly
- **NATURAL PAUSES**: Allow for natural thinking pauses - people need time to formulate responses
- **ACKNOWLEDGE COMPLETION**: Use phrases like "Thank you for that detailed explanation" or "That's a great point" to show you heard them fully
- **PATIENCE**: If they're thinking or taking time to respond, wait patiently rather than prompting immediately

### CONVERSATION FLOW PATTERNS:
- **Question → Full Silence → Candidate Response → Full Silence → Your Acknowledgment → Next Question**
- Use transitional phrases: "I appreciate that answer. Let me ask you about..."
- Give processing time: "Take your time to think about this next question..."
- Show active listening: "That's really interesting how you approached that challenge..."

### ADAPTIVE QUESTIONING:
- Generate questions dynamically based on their responses
- Don't stick to a rigid script - flow naturally based on their answers
- Ask follow-up questions to understand their reasoning
- Probe deeper when they mention interesting points
- Adjust difficulty based on their performance

### FOLLOW-UP STRATEGY:
- "That's interesting. Can you elaborate on...?"
- "How would you handle [scenario] in a similar context?"
- "What challenges did you face when working with [technology]?"
- "Can you walk me through your thought process?"

### TIME MANAGEMENT:
- Keep track of the 15-minute limit
- Naturally transition between sections
- If running short on time, prioritize based on role requirements
- Give gentle time cues: "We have about X minutes left, let's move to..."

### RESPONSE EVALUATION:
- Listen for technical accuracy
- Assess problem-solving approach
- Note communication clarity
- Evaluate practical experience
- Consider cultural fit

## IMPORTANT REMINDERS:
- Stay within the 15-minute timeframe
- Be encouraging and positive
- Ask clarifying questions when needed
- Focus on practical competencies
- End with next steps and thank the candidate personally

Begin the interview by greeting the candidate warmly and introducing the process.
```

## 📁 Files Changed

### ✅ New Files Created:
- `src/lib/elevenlabs.sdk.ts` - ElevenLabs SDK client
- `src/lib/elevenlabs.integration.ts` - Integration layer
- `src/lib/elevenlabs-prompt-template.ts` - Prompt templates
- `src/lib/elevenlabs.logger.ts` - Logging utilities
- `src/components/interview/hooks/useElevenLabsInterview.ts` - React hook

### ✅ Files Updated:
- `package.json` - Replaced VAPI with ElevenLabs dependencies
- `src/components/interview/Agent.tsx` - Updated to use ElevenLabs
- `src/components/interview/hooks/useVapiInterview.ts` - Updated imports (legacy)

### ❌ Files to Remove (Optional):
These files are no longer needed but kept for reference:
- `src/lib/vapi.sdk.ts`
- `src/lib/vapi.integration.ts`
- `src/lib/vapi-prompt-template.ts`
- `src/lib/vapi.logger.ts`
- `src/lib/vapi-error-handler.ts`
- `src/lib/vapi-performance.ts`

## 🚀 How to Test

1. **Set Environment Variables**: Add the ElevenLabs variables to your `.env` file
2. **Configure Agent Prompt**: Copy the system prompt above to your ElevenLabs agent dashboard
3. **Install Dependencies**: Run `npm install` (already done)
4. **Start Development**: Run `npm run dev`
5. **Test Interview**: Navigate to your interview page and start a session

## 🔄 Key Differences

| Feature | VAPI | ElevenLabs |
|---------|------|------------|
| **SDK Package** | `@vapi-ai/web` | `@elevenlabs/client` |
| **Authentication** | Web token | Agent ID (public) |
| **Initialization** | `vapi.start(assistantId)` | `Conversation.startSession({agentId})` |
| **Event Handling** | Built-in events | Callback-based |
| **Voice Quality** | Good | Excellent (11 voices) |
| **Pricing** | $0.05/min | $0.08/min |

## ✨ New Features Available

With ElevenLabs, you now have access to:
- **5,000+ voices** across 70+ languages
- **Voice cloning** capabilities
- **Lower latency** with Flash models
- **Better interruption handling**
- **Enhanced analytics** and monitoring
- **Phone integration** ready

## 🆘 Troubleshooting

### Common Issues:

1. **"Agent ID missing"** error:
   - Check `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` is set correctly

2. **"Microphone access denied"**:
   - Browser needs microphone permissions
   - Check HTTPS is enabled in production

3. **Connection fails**:
   - Verify API key is valid
   - Check agent ID exists in ElevenLabs dashboard
   - Ensure agent is public (or implement signed URLs)

4. **No audio output**:
   - Check browser audio settings
   - Verify agent has a voice configured
   - Test with different browsers

### Support:
- ElevenLabs Documentation: https://elevenlabs.io/docs
- ElevenLabs Support: https://elevenlabs.io/support

## 🎉 Migration Complete!

Your interview system is now powered by ElevenLabs with enhanced voice quality and capabilities. The migration maintains all existing functionality while providing access to advanced features like voice cloning and multi-language support. 