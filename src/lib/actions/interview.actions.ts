"use server";

import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { feedbackSchema } from "@/constants";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CreateFeedbackParams, GetFeedbackByInterviewIdParams, GetLatestInterviewsParams, Feedback, Interview } from "@/types/interview";

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return {
    id: userId,
    name: "", // We'll get the name from the session if needed
    email: "", // We'll get the email from the session if needed
  };
}

/**
 * Creates or updates feedback for an interview using AI analysis
 */
export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // Format the transcript into a readable string for the AI
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Generate AI feedback using Google's Gemini model
    // @ts-ignore - Ignoring type issues with the AI SDK
    const result = await generateObject({
      // @ts-ignore - Type issues with AI SDK
      model: google("gemini-1.5-pro", {
        structuredOutputs: false,
      }),
      // @ts-ignore - Schema property not recognized by type system
      schema: feedbackSchema, // Schema defines the structure of the response
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
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

    // Cast the result to access the object property
    const aiResponse = result as { object: any };
    const object = aiResponse.object;

    // Prepare feedback object with AI-generated data
    const feedbackData = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object?.totalScore || 0,
      categoryScores: object?.categoryScores || [],
      strengths: object?.strengths || [],
      areasForImprovement: object?.areasForImprovement || [],
      finalAssessment: object?.finalAssessment || "No assessment provided",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use existing feedback document or create a new one
    let feedback;
    if (feedbackId) {
      feedback = await (prisma as any).feedback.update({
        where: { id: feedbackId },
        data: feedbackData
      });
    } else {
      feedback = await (prisma as any).feedback.create({
        data: feedbackData
      });
    }

    revalidatePath(`/interview/${interviewId}/feedback`);
    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    // Log error and return failure response
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

/**
 * Retrieves a specific interview by its ID
 */
export async function getInterviewById(id: string) {
  try {
    const interview = await (prisma as any).interview.findUnique({
      where: { id }
    });
    
    return interview;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

/**
 * Gets feedback for a specific interview and user
 */
export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams) {
  const { interviewId, userId } = params;

  // If interviewId or userId is undefined or null, return null
  if (!interviewId || !userId) {
    return null;
  }

  try {
    // Check if feedback already exists for this interview and user
    const existingFeedback = await (prisma as any).feedback.findFirst({
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
    const interviews = await (prisma as any).interview.findMany({
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

/**
 * Gets all interviews created by a specific user
 */
export async function getInterviewsByUserId(userId: string) {
  // If userId is undefined or null, return empty array
  if (!userId) {
    return [];
  }
  
  try {
    const interviews = await (prisma as any).interview.findMany({
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

/**
 * Creates a new interview with personalized questions based on user's resume
 */
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
    // Fetch the user's most recent resume to personalize the interview
    // @ts-ignore - Prisma types
    const userResume = await prisma.resume.findFirst({
      where: { userId: data.userId },
      orderBy: { updatedAt: 'desc' }
    });

    // If we have resume data, use it to personalize the interview
    let personalizedTechstack = data.techstack;
    let personalizedRole = data.role;
    
    if (userResume) {
      // Use skills from resume if available
      if (userResume.skills && userResume.skills.length > 0) {
        personalizedTechstack = userResume.skills;
      }
      
      // Use job title from resume if available
      if (userResume.jobTitle) {
        personalizedRole = userResume.jobTitle;
      }

      console.log(`Personalizing interview for ${userResume.firstName || 'user'} based on resume data`);
    }

    // Generate personalized questions based on resume data and provided role/techstack
    const personalizedQuestions = await generatePersonalizedQuestions({
      userId: data.userId,
      role: personalizedRole,
      level: data.level,
      techstack: personalizedTechstack,
      resumeData: userResume
    });

    // Create the interview with personalized data
    // @ts-ignore - Prisma types not recognizing the interview model
    const interview = await prisma.interview.create({
      data: {
        userId: data.userId,
        role: personalizedRole,
        level: data.level,
        questions: personalizedQuestions.questions || [],
        techstack: personalizedTechstack,
        type: data.type,
        finalized: true
      }
    });
    
    revalidatePath('/interview');
    return { 
      success: true, 
      interviewId: interview.id,
      questions: personalizedQuestions.questions || [],
      techstack: personalizedTechstack,
      role: personalizedRole
    };
  } catch (error) {
    console.error("Error creating interview:", error);
    return { success: false };
  }
}

/**
 * Generates personalized interview questions based on resume data
 */
async function generatePersonalizedQuestions({ 
  userId, 
  role, 
  level, 
  techstack,
  resumeData
}: {
  userId: string;
  role: string;
  level: string;
  techstack: string[];
  resumeData: any;
}) {
  try {
    // Default questions if personalization fails
    const defaultQuestions = [
      `Tell me about your experience with ${techstack.join(', ')}.`,
      `What challenges have you faced as a ${role}?`,
      `How do you stay updated with the latest trends in ${techstack[0] || 'technology'}?`,
      `Describe a project where you used ${techstack[0] || 'your technical skills'}.`,
      `How do you handle tight deadlines?`
    ];

    // If no resume data, return default questions
    if (!resumeData) {
      console.log("No resume data available, using default questions");
      return { questions: defaultQuestions };
    }

    console.log("Generating personalized questions based on resume data");
    
    // Create personalized questions based on resume data
    const personalizedQuestions = [
      // Technical skills questions
      `Tell me about your experience with ${resumeData.skills ? resumeData.skills.slice(0, 3).join(', ') : techstack.join(', ')}.`,
      
      // Role-specific questions
      `What challenges have you faced as a ${resumeData.jobTitle || role}?`,
      
      // Technology trends question
      `How do you stay updated with the latest trends in ${resumeData.skills?.[0] || techstack[0] || 'technology'}?`,
      
      // Project experience question
      `Describe a project where you used ${resumeData.skills?.[0] || techstack[0] || 'your technical skills'}.`,
      
      // Problem-solving question based on role
      `How do you approach problem-solving in your work as a ${resumeData.jobTitle || role}?`,
      
      // Career interest question
      `What interests you most about this ${role} position?`,
      
      // Soft skills question
      `How do you handle tight deadlines and pressure situations?`
    ];
    
    // Add level-specific questions
    if (level.toLowerCase().includes('senior') || level.toLowerCase().includes('lead')) {
      personalizedQuestions.push(
        `How do you mentor junior developers or team members?`,
        `Tell me about a time when you had to make a difficult technical decision. How did you approach it?`
      );
    } else if (level.toLowerCase().includes('mid')) {
      personalizedQuestions.push(
        `How do you balance multiple tasks and priorities in your work?`,
        `Tell me about a time when you had to learn a new technology quickly for a project.`
      );
    } else if (level.toLowerCase().includes('junior')) {
      personalizedQuestions.push(
        `How do you approach learning new technologies or frameworks?`,
        `Tell me about a challenging bug you fixed and how you approached debugging it.`
      );
    }
    
    return { questions: personalizedQuestions };
  } catch (error) {
    console.error("Error in generatePersonalizedQuestions:", error);
    return { questions: [
      `Tell me about your experience with ${techstack.join(', ')}.`,
      `What challenges have you faced as a ${role}?`,
      `How do you stay updated with the latest trends in technology?`,
      `Describe a project where you used your technical skills.`,
      `How do you handle tight deadlines?`
    ] };
  }
}
