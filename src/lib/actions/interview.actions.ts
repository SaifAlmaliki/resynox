"use server";

import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { feedbackSchema } from "@/constants";
import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { CreateFeedbackParams, GetFeedbackByInterviewIdParams, GetLatestInterviewsParams } from "@/types/interview";

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
    const result = await generateObject({
      model: google("gemini-2.0-flash", {
        structuredOutputs: false,
      }),
      // @ts-expect-error - Schema property not recognized by type system
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

    // Cast the result to access the object property with proper error handling
    let object: FeedbackObject | null = null;
    
    try {
      // Check if result exists and has the expected structure
      if (result && typeof result === 'object') {
        const aiResponse = result as { object?: FeedbackObject };
        object = aiResponse.object || null;
      }
    } catch (err) {
      console.error('Error processing AI response:', err);
      // Continue with null object, we'll use fallback values
    }

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

/**
 * Gets all interviews created by a specific user
 */
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
      role: personalizedRole,
      level: data.level,
      techstack: personalizedTechstack,
      resumeData: userResume
    });

    // Create the interview with personalized data
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
  role, 
  level, 
  techstack,
  resumeData
}: {
  role: string;
  level: string;
  techstack: string[];
  resumeData: Record<string, unknown> | null;
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
    // Type guard function to check if resumeData has skills property
    const hasSkills = (data: Record<string, unknown> | null): data is { skills: string[] } => {
      return !!data && 'skills' in data && Array.isArray((data as Record<string, unknown>).skills);
    };

    // Type guard function to check if resumeData has jobTitle property
    const hasJobTitle = (data: Record<string, unknown> | null): data is { jobTitle: string } => {
      return !!data && 'jobTitle' in data && typeof (data as Record<string, unknown>).jobTitle === 'string';
    };

    const personalizedQuestions = [
      // Technical skills questions
      `Tell me about your experience with ${hasSkills(resumeData) ? resumeData.skills.slice(0, 3).join(', ') : techstack.join(', ')}.`,
      
      // Role-specific questions
      `What challenges have you faced as a ${hasJobTitle(resumeData) ? resumeData.jobTitle : role}?`,
      
      // Technology trends question
      `How do you stay updated with the latest trends in ${hasSkills(resumeData) && resumeData.skills.length > 0 ? resumeData.skills[0] : techstack[0] || 'technology'}?`,
      
      // Project experience question
      `Describe a project where you used ${hasSkills(resumeData) && resumeData.skills.length > 0 ? resumeData.skills[0] : techstack[0] || 'your technical skills'}.`,
      
      // Problem-solving question based on role
      `How do you approach problem-solving in your work as a ${hasJobTitle(resumeData) ? resumeData.jobTitle : role}?`,
      
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

/**
 * Generates 10 interview questions based on resume data and user preferences
 * @param params Object containing userId, role, level, techstack, and resumeData
 * @returns Array of interview questions
 */
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
      model: google("gemini-2.0-flash"),
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
