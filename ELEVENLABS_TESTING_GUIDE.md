# ElevenLabs Voice Agent Testing Guide

## 🧪 How to Test Your ElevenLabs Integration

### 1. **Environment Setup**

First, ensure you have your ElevenLabs Agent ID configured:

```bash
# Add to your .env file
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_actual_agent_id_here
```

### 2. **Variable Testing**

Use the test function to verify all variables are being prepared correctly:

```typescript
import { testElevenLabsVariables, runSampleTest } from '@/lib/test-elevenlabs-integration';

// Test with sample data
const testResult = runSampleTest();
console.log(testResult);

// Test with your own data
const customTest = testElevenLabsVariables({
  interviewId: 'test_123',
  candidateName: 'Your Name',
  role: 'Senior Developer',
  experienceLevel: 'Senior',
  techStack: ['React', 'Node.js', 'TypeScript'],
  yearsOfExperience: 5,
  interviewDuration: 45,
  interviewType: 'Technical Interview',
  userId: 'user_123'
});
```

### 3. **Integration Testing Steps**

#### Step 1: Basic Hook Test
```typescript
import { useElevenLabsInterview } from '@/components/interview/hooks/useElevenLabsInterview';

function TestComponent() {
  const {
    callStatus,
    error,
    messages,
    startInterview,
    endInterview
  } = useElevenLabsInterview({
    userName: "Test User",
    type: 'interview'
  });

  const handleStartTest = async () => {
    await startInterview({
      role: "Frontend Developer",
      experienceLevel: "Mid",
      techStack: ["React", "JavaScript"],
      yearsOfExperience: 3,
      interviewDuration: 30,
      interviewType: "Technical Interview"
    });
  };

  return (
    <div>
      <button onClick={handleStartTest}>Start Test Interview</button>
      <p>Status: {callStatus}</p>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

#### Step 2: Variable Verification
Check browser console for these logs:
```
🚀 Starting ElevenLabs conversation with variables:
📋 ElevenLabs Variables being sent: {
  count: 11,
  variables: {
    candidateName: "Test User",
    role: "Frontend Developer",
    experienceLevel: "Mid",
    yearsOfExperience: "3",
    techStack: "React, JavaScript",
    interviewType: "Technical Interview",
    primaryTech: "React",
    // ... other variables
  }
}
```

### 4. **Expected Console Logs**

When testing, you should see these logs in sequence:

```
🚀 Starting ElevenLabs conversation with variables: {...}
📋 ElevenLabs Variables being sent: {...}
✅ Connected to ElevenLabs voice agent
🔄 Status changed: connected
💬 Message received: {...}
```

### 5. **Variable Verification Checklist**

Ensure these 7 core variables are present in the console logs:

- ✅ `candidateName`: Should match the user name
- ✅ `role`: Should match the job role
- ✅ `experienceLevel`: Should be Junior/Mid/Senior
- ✅ `yearsOfExperience`: Should be a string number
- ✅ `techStack`: Should be comma-separated technologies
- ✅ `interviewType`: Should be "Technical Interview"
- ✅ `primaryTech`: Should be the first technology from techStack

### 6. **Testing Different Scenarios**

#### Junior Developer Test:
```typescript
await startInterview({
  role: "Junior Frontend Developer",
  experienceLevel: "Junior",
  techStack: ["HTML", "CSS", "JavaScript"],
  yearsOfExperience: 1,
  interviewDuration: 30,
  interviewType: "Technical Interview"
});
```

#### Senior Developer Test:
```typescript
await startInterview({
  role: "Senior Full Stack Developer",
  experienceLevel: "Senior",
  techStack: ["React", "Node.js", "TypeScript", "PostgreSQL"],
  yearsOfExperience: 8,
  interviewDuration: 60,
  interviewType: "Technical Interview"
});
```

### 7. **Troubleshooting**

#### Common Issues:

**1. Agent ID Not Found**
```
❌ ElevenLabs Agent ID is missing. Please set NEXT_PUBLIC_ELEVENLABS_AGENT_ID
```
**Solution**: Add the environment variable to `.env`

**2. Microphone Access Denied**
```
❌ Microphone access denied. Please allow microphone access
```
**Solution**: Allow microphone permissions in browser

**3. Connection Failed**
```
❌ Failed to start ElevenLabs conversation: [error details]
```
**Solution**: Check your ElevenLabs agent ID and account status

**4. Variables Not Working**
If variables aren't being replaced in your ElevenLabs agent:
- Verify variable names match exactly: `{{candidateName}}`, `{{role}}`, etc.
- Check the console logs to ensure variables are being sent
- Verify your ElevenLabs agent configuration

### 8. **Manual Testing Steps**

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Navigate to interview page** and start an interview

4. **Check console logs** for variable output:
   - Look for "📋 ElevenLabs Variables being sent"
   - Verify all 7 core variables are present
   - Check values are correct

5. **Test voice interaction**:
   - Allow microphone access
   - Speak to test voice recognition
   - Listen for AI responses

6. **Verify ElevenLabs agent behavior**:
   - AI should use your name (`{{candidateName}}`)
   - AI should mention the role (`{{role}}`)
   - Questions should be appropriate for experience level
   - Tech stack should be referenced in questions

### 9. **Success Indicators**

✅ **Environment**: Agent ID is configured
✅ **Variables**: All 7 core variables are being sent
✅ **Connection**: Successfully connects to ElevenLabs
✅ **Voice**: Microphone access granted and working
✅ **Personalization**: AI uses your specific information
✅ **No Errors**: No console errors or connection issues

### 10. **Next Steps After Testing**

Once testing is successful:
1. Replace any remaining VAPI components with ElevenLabs equivalents
2. Update your interview UI components
3. Test with real interview scenarios
4. Deploy and test in production environment

## 🔧 Debug Commands

Add these to your component for debugging:

```typescript
// Log current state
console.log('Interview State:', {
  callStatus,
  error,
  messageCount: messages.length,
  isActive: voiceAgent?.isActive()
});

// Test variable preparation
import { testElevenLabsVariables } from '@/lib/test-elevenlabs-integration';
const variableTest = testElevenLabsVariables(yourParams);
console.log('Variable Test:', variableTest);
```
