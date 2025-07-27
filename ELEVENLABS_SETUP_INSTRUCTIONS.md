# ElevenLabs Voice Agent Setup Instructions

## Overview
This guide explains how to replace VAPI with ElevenLabs for voice interviews. The implementation focuses on passing dynamic variables from your application to ElevenLabs at runtime.

## 📋 Setup Steps

### 1. Environment Variables
Add this to your `.env` file:
```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
```

### 2. ElevenLabs Agent Configuration

#### A. System Prompt (Already Done ✅)
You've already added the system prompt to your ElevenLabs agent. The prompt uses these variables:

**Required Variables (used in your prompt):**
- `{{candidateName}}` - Used throughout the interview
- `{{role}}` - Used in introduction and profile
- `{{experienceLevel}}` - Used in different sections
- `{{yearsOfExperience}}` - Used in candidate profile
- `{{techStack}}` - Used in technical questions
- `{{interviewType}}` - Used in candidate profile
- `{{primaryTech}}` - Used in technical questions

#### B. Variable Configuration
These variables are automatically sent by our application at runtime:

```javascript
// This is what gets sent to your ElevenLabs agent
dynamicVariables: {
  candidateName: "John Doe",
  role: "Senior Full Stack Developer",
  experienceLevel: "Senior",
  yearsOfExperience: "7",
  techStack: "React, Node.js, TypeScript, PostgreSQL",
  interviewType: "Technical Interview",
  primaryTech: "React"
}
```

### 3. Application Integration

#### Replace VAPI Hook Usage
Instead of using `useVapiInterview`, use the new `useElevenLabsInterview`:

```typescript
// OLD (VAPI)
import { useVapiInterview } from '@/components/interview/hooks/useVapiInterview';

// NEW (ElevenLabs)
import { useElevenLabsInterview } from '@/components/interview/hooks/useElevenLabsInterview';
```

#### Example Usage
```typescript
const {
  callStatus,
  error,
  messages,
  isSpeaking,
  lastMessage,
  startInterview,
  endInterview
} = useElevenLabsInterview({
  userName: "John Doe",
  userId: "user123",
  type: 'interview'
});

// Start interview with parameters
await startInterview({
  role: "Senior Full Stack Developer",
  experienceLevel: "Senior", 
  techStack: ["React", "Node.js", "TypeScript"],
  yearsOfExperience: 7,
  interviewDuration: 45,
  interviewType: "Technical Interview"
});
```

## 🔧 Implementation Files

### Core Files Created:
1. **`src/lib/elevenlabs-voice-agent.ts`** - Main voice agent class
2. **`src/lib/elevenlabs-variables.ts`** - Variable definitions and examples
3. **`src/lib/elevenlabs-prompt-template.ts`** - Complete prompt template
4. **`src/components/interview/hooks/useElevenLabsInterview.ts`** - React hook

### Key Features:
- ✅ Dynamic variable passing to ElevenLabs
- ✅ Real-time conversation handling
- ✅ Status management (connecting, speaking, listening, etc.)
- ✅ Error handling and microphone permissions
- ✅ Message history tracking
- ✅ TypeScript support with proper types

## 📝 Variable Examples

When you start an interview, these variables are automatically calculated and sent to ElevenLabs:

```javascript
{
  candidateName: "John Doe",
  role: "Senior Full Stack Developer",
  experienceLevel: "Senior", 
  yearsOfExperience: "7",
  techStack: "React, Node.js, TypeScript, PostgreSQL",
  interviewDuration: "45",
  interviewType: "Technical Interview",
  isJunior: "false",
  isMid: "false",
  isSenior: "true",
  introTime: "7",
  technicalTime: "18", 
  codingTime: "14",
  behavioralTime: "9",
  wrapupTime: "2",
  primaryTech: "React",
  experienceCategory: "Senior"
}
```

## 🧪 Testing Your Integration

### Quick Test
1. Set `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` in your `.env`
2. Use the test function:
   ```typescript
   import { runSampleTest } from '@/lib/test-elevenlabs-integration';
   
   // This will show you exactly what variables are being sent
   const testResult = runSampleTest();
   console.log(testResult);
   ```

### Full Integration Test
```typescript
import { useElevenLabsInterview } from '@/components/interview/hooks/useElevenLabsInterview';

const { startInterview } = useElevenLabsInterview({
  userName: "Test User",
  type: 'interview'
});

await startInterview({
  role: "Frontend Developer",
  experienceLevel: "Mid",
  techStack: ["React", "JavaScript"],
  yearsOfExperience: 3,
  interviewDuration: 30,
  interviewType: "Technical Interview"
});
```

### What to Look For
Check browser console for:
- `📋 ElevenLabs Variables being sent:` - Shows all variables
- `✅ Connected to ElevenLabs voice agent` - Confirms connection
- All 7 core variables should be present and correct

**📖 For detailed testing instructions, see `ELEVENLABS_TESTING_GUIDE.md`**

## 🔍 Troubleshooting

### Common Issues:
1. **Agent ID not found**: Check `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` in your environment
2. **Microphone access denied**: Ensure browser permissions are granted
3. **Variables not working**: Verify variable names match exactly in ElevenLabs agent
4. **Connection issues**: Check ElevenLabs service status and API limits

### Debug Logging:
The implementation includes comprehensive console logging. Check browser console for:
- `🚀 Starting ElevenLabs conversation with variables`
- `✅ Connected to ElevenLabs voice agent`
- `💬 Message received`
- `🔄 Status changed`

## 📚 Next Steps

1. Replace VAPI components with ElevenLabs equivalents
2. Update your interview UI to use the new hook
3. Test thoroughly with different candidate profiles
4. Monitor performance and adjust as needed

The ElevenLabs integration is now ready to replace VAPI with dynamic variable support!
