# Resume Analysis Feature Implementation

## Overview
This document outlines the implementation of the AI Resume Analysis feature for the Resynox application. This feature allows Pro subscribers to upload PDF resumes and job descriptions to receive AI-powered analysis of their strengths, weaknesses, and recommendations.

## Architecture

### Database Schema
- **ResumeAnalysis Model**: Stores analysis data including PDF URLs, job descriptions, results, and status
- **Fields**: id, userId, pdfFileUrl, jobDescription, analysisResult, status, errorMessage, createdAt, updatedAt
- **Indexes**: userId, status, createdAt for optimal query performance

### API Endpoints
1. **Resume Analysis Actions** (`/src/app/(main)/resume-analysis/actions.ts`)
   - `analyzeResume()`: Main function to handle PDF upload and analysis
   - `getUserAnalyses()`: Retrieve user's previous analyses
   - `sendToN8nWebhook()`: Send data to n8n workflow
   - `waitForAnalysisResult()`: Poll for analysis completion with 25s timeout

2. **Webhook Endpoint** (`/src/app/api/resume-analysis-webhook/route.ts`)
   - Receives analysis results from n8n workflow
   - Updates database with completed analysis data
   - Handles error cases and validation

### Frontend Components
- **Main Page** (`/src/app/(main)/resume-analysis/page.tsx`)
  - PDF upload form with validation
  - Job description textarea
  - Real-time analysis status
  - Previous analyses history
  - Results display with strengths/weaknesses

## Features

### 1. PDF Upload & Validation
- **File Type**: Only PDF files accepted
- **Size Limit**: 10MB maximum
- **Storage**: Vercel Blob Storage for scalability
- **Validation**: Client and server-side validation using Zod

### 2. Job Description Input
- **Minimum Length**: 10 characters required
- **Format**: Plain text textarea
- **Integration**: Sent to n8n alongside PDF URL

### 3. Subscription Validation
- **Requirement**: Pro or Pro Plus subscription
- **Check**: Server-side validation using `canUseAITools()`
- **Fallback**: Premium modal for upgrade

### 4. n8n Integration
- **Webhook URL**: Configurable via `N8N_RESUME_ANALYSIS_WEBHOOK_URL`
- **Payload**: JSON with analysisId, pdfUrl, jobDescription, userId
- **Timeout**: 25-second maximum wait time
- **Response**: Strengths, weaknesses, score, recommendations

### 5. Real-time Status Updates
- **States**: pending, processing, completed, failed
- **Polling**: 1-second intervals for status updates
- **UI Feedback**: Loading spinners and status indicators

### 6. Results Display
- **Strengths**: Green checkmarks with detailed points
- **Weaknesses**: Red warning icons with improvement areas
- **Score**: Overall rating out of 100 (optional)
- **Recommendations**: Blue lightbulb icons with suggestions

## Implementation Details

### Environment Variables
```env
N8N_RESUME_ANALYSIS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/resume-analysis
```

### Database Migration
```sql
-- Run this migration to create the resume_analyses table
npx prisma migrate dev --name add_resume_analysis_table
```

### File Structure
```
src/
├── app/
│   ├── (main)/
│   │   └── resume-analysis/
│   │       ├── actions.ts          # Server actions
│   │       └── page.tsx            # Main UI component
│   └── api/
│       └── resume-analysis-webhook/
│           └── route.ts            # Webhook handler
├── lib/
│   └── validation.ts               # Zod schemas
└── middleware.ts                   # Route protection
```

### Error Handling
1. **Upload Failures**: File size/type validation with user feedback
2. **n8n Timeouts**: 25-second timeout with retry suggestion
3. **Webhook Errors**: Graceful error handling and database updates
4. **Subscription Checks**: Premium modal for non-Pro users

## n8n Workflow Requirements

### Expected Webhook Payload
```json
{
  "analysisId": "cuid_string",
  "pdfUrl": "https://blob.vercel-storage.com/...",
  "jobDescription": "Full job description text...",
  "userId": "user_clerk_id"
}
```

### Expected Response Format
```json
{
  "analysisId": "cuid_string",
  "strengths": [
    "Strong technical skills in React and Node.js",
    "Excellent problem-solving abilities",
    "Good communication skills"
  ],
  "weaknesses": [
    "Limited experience with cloud platforms",
    "Could improve project management skills"
  ],
  "overallScore": 85,
  "recommendations": [
    "Consider adding cloud certifications",
    "Highlight specific project achievements"
  ]
}
```

### Response Endpoint
- **URL**: `https://your-app.com/api/resume-analysis-webhook`
- **Method**: POST
- **Headers**: Content-Type: application/json

## Security Considerations

1. **Authentication**: Pro subscription required for access
2. **File Validation**: Strict PDF-only uploads with size limits
3. **Rate Limiting**: Inherent via subscription model
4. **Data Storage**: Secure Vercel Blob Storage with public access
5. **Webhook Security**: Public endpoint for n8n responses (consider adding token validation)

## Performance Optimizations

1. **Database Indexes**: Optimized queries on userId, status, createdAt
2. **Polling Strategy**: 1-second intervals to balance responsiveness and load
3. **File Storage**: Vercel Blob for CDN-backed file delivery
4. **Component Optimization**: React hooks for efficient re-renders

## Testing Considerations

1. **Unit Tests**: Validation schemas and server actions
2. **Integration Tests**: n8n webhook flow end-to-end
3. **Error Scenarios**: Timeout handling, file upload failures
4. **Subscription Validation**: Pro/non-Pro user access

## Deployment Checklist

- [ ] Add `N8N_RESUME_ANALYSIS_WEBHOOK_URL` to environment variables
- [ ] Run database migration: `npx prisma migrate deploy`
- [ ] Configure n8n workflow with correct webhook endpoints
- [ ] Test file upload to Vercel Blob Storage
- [ ] Verify subscription validation works correctly
- [ ] Test complete analysis flow with n8n integration

## Future Enhancements

1. **Bulk Analysis**: Multiple resume uploads
2. **Comparison Tool**: Compare multiple analyses
3. **Export Options**: PDF/Word export of analysis results
4. **Templates**: Industry-specific analysis templates
5. **AI Improvements**: More detailed scoring and recommendations
6. **Mobile Optimization**: Better mobile upload experience

## Troubleshooting

### Common Issues
1. **Prisma Errors**: Ensure migration is run and client is generated
2. **File Upload Fails**: Check Vercel Blob Storage configuration
3. **n8n Timeout**: Verify webhook URL and n8n workflow status
4. **Subscription Issues**: Check user subscription status in database

### Debug Steps
1. Check browser console for client-side errors
2. Review server logs for API errors
3. Verify n8n workflow execution logs
4. Test webhook endpoint manually with curl/Postman

## Support

For issues or questions about this implementation:
1. Check the troubleshooting section above
2. Review the error messages in the application
3. Verify environment variables are correctly set
4. Test n8n webhook connectivity independently 