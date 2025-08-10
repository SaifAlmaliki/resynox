// AI-assisted resume content generation functions

"use server";

import openai from "@/lib/openai";
import { canUseAITools } from "@/lib/permissions";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { POINT_COSTS, hasPoints, deductPoints, creditPoints } from "@/lib/points";
import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  WorkExperience,
  ResumeValues,
  CoverLetterValues,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

// Generates a professional summary for a resume
export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  // Points gating and deduction for resume summary
  const cost = POINT_COSTS.resume_summary;
  const sufficient = await hasPoints(userId, cost);
  if (!sufficient) {
    throw new Error("Insufficient points. Generating a resume summary requires 4 points.");
  }
  const deducted = await deductPoints(userId, cost, "resume_summary_generate");
  if (!deducted.ok) {
    throw new Error(deducted.message || "Insufficient points");
  }

  const { jobTitle, workExperiences, educations, skills } = generateSummarySchema.parse(input);

  const systemMessage = `
    You are a job resume generator AI. Your task is to write a professional introduction summary for a resume given the user's provided data.
    Only return the summary and do not include any other information in the response. Keep it concise, professional and short.
  `;

  const userMessage = `
    Please generate a professional resume summary from this data:

    Job title: ${jobTitle || "N/A"}

    Work experience:
    ${workExperiences
      ?.map(
        (exp) => `
        Position: ${exp.position || "N/A"} at ${exp.company || "N/A"} from ${exp.startDate || "N/A"} to ${exp.endDate || "Present"}

        Description:
        ${exp.description || "N/A"}
      `,
      )
      .join("\n\n")}

    Education:
    ${educations
      ?.map(
        (edu) => `
        Degree: ${edu.degree || "N/A"} at ${edu.school || "N/A"} from ${edu.startDate || "N/A"} to ${edu.endDate || "N/A"}
      `,
      )
      .join("\n\n")}

    Skills:
    ${skills}
  `;

  console.log("systemMessage", systemMessage);
  console.log("userMessage", userMessage);

  // Call the OpenAI API to generate a summary
  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
  } catch (e) {
    await creditPoints(userId, cost, "refund_resume_summary_failure");
    throw e;
  }

  const aiResponse = completion.choices[0].message.content;

  if (!aiResponse) {
    await creditPoints(userId, cost, "refund_resume_summary_empty_output");
    throw new Error("Failed to generate AI response");
  }

  return aiResponse;
}

// Generates a work experience entry from a description
export async function generateWorkExperience(input: GenerateWorkExperienceInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  // Points gating and deduction for enhance experience
  const cost = POINT_COSTS.enhance_experience;
  const sufficient = await hasPoints(userId, cost);
  if (!sufficient) {
    throw new Error("Insufficient points. Smart fill requires 2 points.");
  }
  const deducted = await deductPoints(userId, cost, "enhance_experience_generate");
  if (!deducted.ok) {
    throw new Error(deducted.message || "Insufficient points");
  }

  const { description } = generateWorkExperienceSchema.parse(input);

  const systemMessage = `
    You are a job resume generator AI. Your task is to generate a single work experience entry based on the user input.
    Your response must adhere to the following structure. You can omit fields if they can't be inferred from the provided data, but don't add any new ones.

    Job title: <job title>
    Company: <company name>
    Start date: <format: YYYY-MM-DD> (only if provided)
    End date: <format: YYYY-MM-DD> (only if provided)
    Description: <an optimized description in bullet format, might be inferred from the job title>
  `;

  const userMessage = `
    Please provide a work experience entry from this description:
    ${description}
  `;

  // Call the OpenAI API to generate a work experience entry
  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7, // Slightly creative but still professional
      max_tokens: 1500, // Allow for a comprehensive cover letter
    });
  } catch (e) {
    await creditPoints(userId, cost, "refund_enhance_experience_failure");
    throw e;
  }

  const aiResponse = completion.choices[0].message.content;

  if (!aiResponse) {
    await creditPoints(userId, cost, "refund_enhance_experience_empty_output");
    throw new Error("Failed to generate AI response");
  }

  console.log("aiResponse", aiResponse);


  return {
    position: aiResponse.match(/Job title: (.*)/)?.[1] || "",
    company: aiResponse.match(/Company: (.*)/)?.[1] || "",
    description: (aiResponse.match(/Description:([\s\S]*)/)?.[1] || "").trim(),
    startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
  } satisfies WorkExperience;
}

// Generates a personalized cover letter
export async function generateCoverLetter(input: CoverLetterValues & Partial<ResumeValues>) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  const { jobDescription, workExperiences, educations, skills, firstName, lastName, email, phone, jobTitle, summary } = input;

  if (!jobDescription?.trim()) {
    throw new Error("Job description is required to generate a cover letter");
  }

  // Get current date for the cover letter
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const systemMessage = `
    You are a professional cover letter writer. Your task is to write a compelling cover letter that:
    1. Is precisely tailored to the specific job description by analyzing key requirements and responsibilities
    2. EXPLICITLY highlights relevant experience and skills from the resume that match the job requirements
    3. Maintains a professional yet engaging tone
    4. Is well-structured with clear paragraphs (introduction, body with experience highlights, closing)
    5. Includes a proper greeting and closing
    6. Specifically mentions how the candidate's previous work experience makes them a good fit for this role
    7. Draws direct connections between the candidate's skills/experience and the job requirements
    8. Uses specific achievements and metrics from past roles when available
    9. Demonstrates understanding of the industry and company needs
    10. Conveys enthusiasm for the specific position and company
    11. ALWAYS uses the EXACT current date provided in the user message, not a placeholder or made-up date
    
    Only return the cover letter text without any additional formatting or information.
  `;

  // Log the resume data to help with debugging
  console.log('Resume data for cover letter generation:', {
    firstName, lastName, jobTitle, summary,
    workExperiences: workExperiences?.length,
    educations: educations?.length,
    skills: skills?.length,
    currentDate: formattedDate
  });

  // First, analyze the job description to extract key requirements and responsibilities
  const analysisPrompt = `
    Analyze this job description and extract the key requirements, skills, and responsibilities:
    ${jobDescription}
    
    Format your response as a JSON object with these fields:
    1. keyRequirements: Array of the most important skills and qualifications
    2. responsibilities: Array of main job responsibilities
    3. companyValues: Any company values or culture elements mentioned
    4. industryContext: The industry or field context
  `;
  
  // Analyze the job description first
  const analysisCompletion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { 
        role: "system", 
        content: "You are an expert job analyst. Extract key information from job descriptions in a structured format." 
      },
      { role: "user", content: analysisPrompt },
    ],
    response_format: { type: "json_object" },
  });
  
  let jobAnalysis = {};
  try {
    jobAnalysis = JSON.parse(analysisCompletion.choices[0].message.content || '{}');
    console.log('Job analysis:', jobAnalysis);
  } catch (error) {
    console.error('Error parsing job analysis:', error);
    // Continue with default empty object if parsing fails
  }

  const userMessage = `
    Please write a cover letter for this job description:

    ${jobDescription}

    Using this candidate information:
    Name: ${firstName || ''} ${lastName || ''}
    Email: ${email || ''}
    Phone: ${phone || ''}
    Current Job Title: ${jobTitle || "N/A"}
    Professional Summary: ${summary || "N/A"}
    Current Date: ${formattedDate} (IMPORTANT: Use this exact date in the cover letter header)

    ${workExperiences && workExperiences.length > 0 ? `Work Experience:
    ${workExperiences
      .map(
        (exp) => `
        Position: ${exp.position || "N/A"} at ${exp.company || "N/A"}
        Duration: ${exp.startDate || "N/A"} to ${exp.endDate || "Present"}
        Description: ${exp.description || "N/A"}
      `
      )
      .join("\n\n")}` : 'No work experience provided'}

    ${educations && educations.length > 0 ? `Education:
    ${educations
      .map(
        (edu) => `
        ${edu.degree || "N/A"} at ${edu.school || "N/A"}
        Duration: ${edu.startDate || "N/A"} to ${edu.endDate || "N/A"}
      `
      )
      .join("\n\n")}` : 'No education provided'}

    ${skills && skills.length > 0 ? `Skills: ${skills.join(", ")}` : 'No skills provided'}

    Job Analysis:
    ${JSON.stringify(jobAnalysis, null, 2)}

    IMPORTANT INSTRUCTIONS:
    1. Use the job analysis to precisely match the candidate's experience with the job requirements
    2. You MUST explicitly mention how the candidate's previous work experience makes them a good fit for this role
    3. Draw direct connections between the candidate's skills/experience and specific requirements in the job description
    4. Reference at least 2-3 specific requirements from the job description and how the candidate meets them
    5. Make it professional, concise, and engaging
    6. If the candidate has limited experience, focus on their potential, transferable skills, and enthusiasm
    7. The cover letter should be personalized and not generic
    8. Include a brief mention of why the candidate is interested in this specific company (based on company values if available)
    9. Format as a proper business letter with date, greeting, body paragraphs, and professional closing
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7, // Slightly creative but still professional
    max_tokens: 1500, // Allow for a comprehensive cover letter
  });

  const aiResponse = completion.choices[0].message.content;

  if (!aiResponse) {
    throw new Error("Failed to generate AI response");
  }

  return aiResponse;
}
