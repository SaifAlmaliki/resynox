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

    // If this is a voice interview, check and increment usage
    if (type === "voice") {
      const subscription = await (prisma as PrismaClient).userSubscription.findUnique({
        where: { userId }
      });

      if (subscription) {
        const now = new Date();
        const periodEnd = new Date(subscription.stripeCurrentPeriodEnd);
        
        // Check if we need to reset the counter (new billing period)
        if (now > periodEnd) {
          await (prisma as PrismaClient).userSubscription.update({
            where: { userId },
            data: {
              voiceInterviewsUsed: 1,
              voiceInterviewsResetDate: periodEnd
            }
          });
        } else {
          // Increment the usage count
          await (prisma as PrismaClient).userSubscription.update({
            where: { userId },
            data: {
              voiceInterviewsUsed: (subscription.voiceInterviewsUsed || 0) + 1
            }
          });
        }
      }
    }

    // Create the interview
    const interview = await (prisma as PrismaClient).interview.create({
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




export async function generateInterviewQuestions(params: {
  userId: string;
  role: string;
  level: string;
  techstack: string[];
  resumeData: Record<string, unknown>;
}) {
  const { role, level, techstack, resumeData } = params;
  
  try {
    // Create a prompt that describes the candidate and the interview context
    const experienceLevelMap: Record<string, string> = {
      entry: "Entry-level",
      mid: "Mid-level",
      senior: "Senior",
      lead: "Lead/Manager",
      executive: "Executive"
    };
    
    const experienceLevel = experienceLevelMap[level] || "Mid-level";
    const technologies = techstack.join(", ");
    const jobTitle = (resumeData.jobTitle as string) || role;
    const summary = (resumeData.summary as string) || "";
    
    // Use AI to generate personalized interview questions
    const result = await generateObject({
      model: google("gemini-1.5-flash"),
      output: "no-schema",
      prompt: `
        Generate 20 interview questions for a ${experienceLevel} ${role} position.
        
        Candidate background:
        - Job Title: ${jobTitle}
        - Skills: ${technologies}
        - Summary: ${summary}
        
        Requirements:
        1. Questions should be tailored to the candidate's experience level (${experienceLevel}) and role (${role}).
        2. Include 12 technical questions related to their skills (${technologies}).
        3. Include 8 behavioral questions that assess soft skills relevant to the role.
        4. The behavioral questions should evaluate teamwork, problem-solving, communication, adaptability, leadership, conflict resolution, time management, and work ethic.
        5. Questions should be challenging but appropriate for their experience level.
        6. Each question should be concise and clear.
        7. Return exactly 20 questions, numbered from 1 to 20.
        8. Format each question as a single string without additional formatting.
      `,
      system: "You are an expert interviewer creating personalized interview questions based on a candidate's resume and job target."
    });
    
    // Return the generated questions - convert to array of strings
    const questions = Array.isArray(result) ? result : 
      typeof result === 'object' && result !== null ? 
        Object.values(result).filter(q => typeof q === 'string') : 
        [];
    
    // Ensure we have exactly 20 questions
    if (questions.length === 20) {
      return questions as string[];
    }
    
    // If we don't have exactly 10 questions, return default questions
    return getDefaultQuestions(role, techstack);
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return getDefaultQuestions(role, techstack);
  }
}

// Helper function to generate default questions with a mix of technical and behavioral questions
function getDefaultQuestions(role: string, techstack: string[]): string[] {
  // Technical questions (12)
  const technicalQuestions = [
    `Tell me about your experience as a ${role}.`,
    `What projects have you worked on that involved ${techstack[0] || 'your core technologies'}?`,
    `How do you stay updated with the latest trends in ${role} development?`,
    `Explain how you would implement ${techstack[0] || 'a key technology'} in a real-world project.`,
    `What challenges have you faced when working with ${techstack[1] || 'modern technologies'} and how did you overcome them?`,
    `Describe your approach to debugging complex issues in ${techstack[2] || 'your technical environment'}.`,
    `What methodologies do you follow for ${role} work?`,
    `How do you ensure the quality of your ${role} deliverables?`,
    `Describe a technical solution you designed that you're particularly proud of.`,
    `How would you optimize a system that's experiencing performance issues?`,
    `What tools and technologies do you use for ${techstack[0] || 'your daily work'}?`,
    `How do you approach learning a new ${techstack[1] || 'technology'} that you haven't worked with before?`
  ];
  
  // Behavioral questions (8)
  const behavioralQuestions = [
    `Tell me about a time when you had to work with a difficult team member. How did you handle the situation?`,
    `Describe a situation where you had to learn a new technology or skill quickly. What was your approach?`,
    `How do you handle feedback on your work, especially when it's critical?`,
    `Give an example of a time when you had to make a difficult decision with limited information. What was your thought process?`,
    `Describe a situation where you had to lead a team or project. What was your leadership style?`,
    `Tell me about a conflict you had with a colleague or manager and how you resolved it.`,
    `How do you manage your time when working on multiple projects with competing deadlines?`,
    `Describe your work ethic and how it influences your approach to challenging tasks.`
  ];
  
  return [
    ...technicalQuestions,
    ...behavioralQuestions
  ];
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
