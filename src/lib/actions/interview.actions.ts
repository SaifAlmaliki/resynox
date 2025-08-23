"use server";

import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { CreateFeedbackParams, GetFeedbackByInterviewIdParams, GetLatestInterviewsParams, SavedMessage } from "@/types/interview";
import { z } from "zod";
import { interviewAnalytics } from "../interview-analytics";
import { POINT_COSTS, hasPoints, deductPoints } from "@/lib/points";

/**
 * Get the current authenticated user
 * Note: Name will come from resume, this just provides user ID
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  return {
    id: userId,
    name: "", // Name will be populated from selected resume
    email: "",
  };
}

/**
 * Creates or updates feedback for an interview using AI analysis
 */
export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId, additionalContext } = params;

  try {
    // Format the transcript into a readable string for the AI
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Generate AI feedback using Google's Gemini model
    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: z.object({
        totalScore: z.number().min(0).max(100).describe("Overall score from 0-100"),
        categoryScores: z.array(z.object({
          name: z.string().describe("Category name"),
          score: z.number().min(0).max(100).describe("Score from 0-100"),
          comment: z.string().describe("Detailed feedback for this category"),
        })).describe("Scores for each category"),
        strengths: z.array(z.string()).describe("List of candidate strengths"),
        areasForImprovement: z.array(z.string()).describe("List of areas for improvement"),
        finalAssessment: z.string().describe("Overall assessment and recommendations"),
      }),
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        
        ${additionalContext ? `
        Interview Context:
        - Role: ${additionalContext.role || 'Not specified'}
        - Level: ${additionalContext.level || 'Not specified'}
        - Tech Stack: ${additionalContext.techstack?.join(', ') || 'Not specified'}
        ` : ''}
        
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    // Define a type for AI response object
    interface FeedbackObject {
      totalScore: number;
      categoryScores: Array<{
        name: string;
        score: number;
        comment: string;
      }>;
      strengths: string[];
      areasForImprovement: string[];
      finalAssessment: string;
    }

    // With Zod schema, the result.object contains the structured response
    const object: FeedbackObject = result.object;

    // Prepare feedback object with AI-generated data
    const feedbackData = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore || 0,
      categoryScores: object.categoryScores || [],
      strengths: object.strengths || [],
      areasForImprovement: object.areasForImprovement || [],
      finalAssessment: object.finalAssessment || "No assessment provided",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use existing feedback document or create a new one
    // Define a type for the feedback data
    type FeedbackData = {
      id: string;
      interviewId: string;
      userId: string;
      totalScore: number;
      categoryScores: Array<{
        name: string;
        score: number;
        comment: string;
      }>;
      strengths: string[];
      areasForImprovement: string[];
      finalAssessment: string;
      createdAt: Date;
      updatedAt: Date;
    };

    let feedback: FeedbackData;
    if (feedbackId) {
      feedback = await (prisma as PrismaClient).feedback.update({
        where: { id: feedbackId },
        data: feedbackData
      }) as unknown as FeedbackData;
    } else {
      feedback = await (prisma as PrismaClient).feedback.create({
        data: feedbackData
      }) as unknown as FeedbackData;
    }

    // Update the interview's updatedAt timestamp to reflect when it was completed
    // This ensures the duration calculation works correctly in the feedback page
    await (prisma as PrismaClient).interview.update({
      where: { id: interviewId },
      data: { 
        finalized: true,
        updatedAt: new Date()
      }
    });

    revalidatePath(`/interview/${interviewId}/feedback`);
    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    // Log error and return failure response
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

// Retrieves a specific interview by its ID
export async function getInterviewById(id: string) {
  try {
    // Define a type for the interview data
    type InterviewData = {
      id: string;
      userId: string;
      role: string;
      level: string;
      questions: string[];
      techstack: string[];
      type: string;
      finalized: boolean;
      createdAt: Date;
      updatedAt?: Date;
    };

    const interview = await (prisma as PrismaClient).interview.findUnique({
      where: { id }
    }) as unknown as InterviewData | null;
    
    return interview;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

// Gets feedback for a specific interview and user
export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams) {
  const { interviewId, userId } = params;

  // If interviewId or userId is undefined or null, return null
  if (!interviewId || !userId) {
    return null;
  }

  try {
    // Check if feedback already exists for this interview and user
    const existingFeedback = await (prisma as PrismaClient).feedback.findFirst({
      where: {
        interviewId: interviewId,
        userId: userId
      }
    });
    
    return existingFeedback;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

/**
 * Retrieves the most recent interviews excluding the user's own
 */
export async function getLatestInterviews(params: GetLatestInterviewsParams) {
  const { userId, limit = 20 } = params;

  // If userId is undefined or null, return empty array
  if (!userId) {
    return [];
  }

  try {
    const interviews = await (prisma as PrismaClient).interview.findMany({
      where: {
        userId: { not: userId },
        finalized: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    return interviews;
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return [];
  }
}

// Gets all interviews created by a specific user
export async function getInterviewsByUserId(userId: string) {
  // If userId is undefined or null, return empty array
  if (!userId) {
    return [];
  }
  
  try {
    const interviews = await (prisma as PrismaClient).interview.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return interviews;
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return [];
  }
}

// Creates a new interview with personalized questions based on user's resume
export async function createInterview(data: {
  userId: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  type: string;
  skipQuestionSelection?: boolean;
}) {
  try {
    const { userId, role, level, questions, techstack, type } = data;

    // Validate required fields
    // Voice interviews don't need questions (ElevenLabs generates them dynamically)
    const requiresQuestions = type !== "voice";
    if (!userId || !role || !level || (requiresQuestions && !questions.length) || !techstack.length) {
      return { success: false };
    }

    // For voice interviews: perform only a cheap points sufficiency check before creation
    if (type === "voice") {
      const cost = POINT_COSTS.voice_session_start;
      const sufficient = await hasPoints(userId, cost);
      if (!sufficient) {
        return { success: false };
      }
    }

    // Create the interview
    let interview;
    try {
      interview = await (prisma as PrismaClient).interview.create({
        data: {
          userId,
          role,
          level,
          questions,
          techstack,
          type,
          finalized: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (err) {
      // No deduction occurred yet, so no refund needed here
      throw err;
    }

    // After interview is created: deduct points for voice and increment legacy usage
    if (type === "voice") {
      const cost = POINT_COSTS.voice_session_start;
      const deducted = await deductPoints(userId, cost, "voice_session_start", {
        interviewId: interview.id,
        role,
        experienceLevel: level,
        interviewType: type,
        techStack: techstack,
        userId,
        requestedQuestions: Array.isArray(questions) ? questions.length : 0,
      });
      if (!deducted.ok) {
        // Roll back the created interview if payment failed
        await (prisma as PrismaClient).interview.delete({ where: { id: interview.id } });
        return { success: false };
      }

      // Legacy usage increment after successful deduction
      const subscription = await (prisma as PrismaClient).userSubscription.findUnique({
        where: { userId }
      });

      if (subscription) {
        const now = new Date();
        const periodEnd = new Date(subscription.stripeCurrentPeriodEnd);

        if (now > periodEnd) {
          await (prisma as PrismaClient).userSubscription.update({
            where: { userId },
            data: {
              voiceInterviewsUsed: 1,
              voiceInterviewsResetDate: periodEnd
            }
          });
        } else {
          await (prisma as PrismaClient).userSubscription.update({
            where: { userId },
            data: {
              voiceInterviewsUsed: (subscription.voiceInterviewsUsed || 0) + 1
            }
          });
        }
      }
    }

    revalidatePath("/interview");
    return { 
      success: true, 
      interviewId: interview.id,
      questions,
      techstack,
      role
    };
  } catch (error) {
    console.error("Error creating interview:", error);
    return { success: false };
  }
}

/**
 * Enhanced feedback creation that complements the existing feedback system
 * This adds analytics insights while preserving the original feedback structure
 */
export async function createEnhancedFeedback(params: CreateFeedbackParams & {
  sessionMetrics?: any;
  performanceData?: any;
  includeAnalytics?: boolean; // Optional flag to enable analytics
}) {
  const { 
    interviewId, 
    userId, 
    transcript, 
    feedbackId, 
    sessionMetrics, 
    performanceData,
    includeAnalytics = false // Default to false to preserve existing behavior
  } = params;

  try {
    // Always create the standard feedback first (your existing approach)
    const standardFeedback = await createFeedback({
      interviewId,
      userId,
      transcript,
      feedbackId
    });

    // If analytics are not requested, return the standard feedback
    if (!includeAnalytics || !standardFeedback.success) {
      return standardFeedback;
    }

    // Only add analytics if explicitly requested and we have session data
    if (sessionMetrics) {
      // Convert transcript to SavedMessage format
      const formattedMessages: SavedMessage[] = transcript.map(msg => ({
        role: (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') 
          ? (msg.role as 'user' | 'assistant' | 'system')
          : 'user',
        content: msg.content
      }));

      // Generate analytics as supplementary data
      const analytics = interviewAnalytics.generateFullAnalysis(
        formattedMessages,
        sessionMetrics,
        performanceData?.errors || []
      );

      // Fetch the created feedback to add analytics
      const existingFeedback = await getFeedbackByInterviewId({
        interviewId,
        userId
      });

      if (existingFeedback) {
         // Update only the updatedAt field and add analytics as metadata
         // Store analytics in finalAssessment as additional context (non-destructive)
         const enhancedAssessment = `${existingFeedback.finalAssessment}

--- Analytics Insights ---
${analytics.insights.map(insight => `• ${insight}`).join('\n')}

--- Additional Recommendations ---
${analytics.recommendations.map(rec => `• ${rec}`).join('\n')}

--- Skills Demonstrated ---
${analytics.skillsAssessed.join(', ')}

Interview Quality: ${analytics.interviewQuality}`;

         const enhancedData = {
           finalAssessment: enhancedAssessment,
           updatedAt: new Date()
         };

        await prisma.feedback.update({
          where: { id: existingFeedback.id },
          data: enhancedData
        });

        return { 
          success: true, 
          feedbackId: existingFeedback.id, 
          analytics,
          enhanced: true 
        };
      }
    }

    // Return standard feedback if analytics couldn't be added
    return { ...standardFeedback, enhanced: false };

  } catch (error) {
    console.error("Error creating enhanced feedback:", error);
    
    // Fallback to standard feedback creation if enhancement fails
    return createFeedback({
      interviewId,
      userId,
      transcript,
      feedbackId
    });
  }
}
