// Summary:
// This module provides functions to generate AI-assisted resume content, including professional summaries and work experience entries.
// It uses OpenAI's GPT model for natural language processing and ensures user authorization and subscription level compliance.

"use server";

import openai from "@/lib/openai";
import { canUseAITools } from "@/lib/permissions";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  WorkExperience,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

/**
 * Generates a professional summary for a resume based on user input.
 * Validates input, ensures user authorization, checks subscription level,
 * and calls the OpenAI API to create the summary.
 *
 * @param {GenerateSummaryInput} input - Input data for summary generation.
 * @returns {string} The generated summary.
 * @throws {Error} If user is unauthorized, lacks access, or the API fails.
 */
export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth(); // Retrieve the authenticated user's ID

  if (!userId) {
    throw new Error("Unauthorized"); // Ensure the user is logged in
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId); // Check subscription level

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature"); // Validate access rights
  }

  // Parse and validate the input data
  const { jobTitle, workExperiences, educations, skills } = generateSummarySchema.parse(input);

  // Define system and user messages for the AI model
  const systemMessage = `
    You are a job resume generator AI. Your task is to write a professional introduction summary for a resume given the user's provided data.
    Only return the summary and do not include any other information in the response. Keep it concise and professional.
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
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
  });

  const aiResponse = completion.choices[0].message.content; // Extract AI response

  if (!aiResponse) {
    throw new Error("Failed to generate AI response"); // Ensure a response is received
  }

  return aiResponse;
}

/**
 * Generates a structured work experience entry based on user input.
 * Validates input, ensures user authorization, checks subscription level,
 * and uses OpenAI to create the work experience entry.
 *
 * @param {GenerateWorkExperienceInput} input - Input description for the work experience.
 * @returns {WorkExperience} The generated work experience entry.
 * @throws {Error} If user is unauthorized, lacks access, or the API fails.
 */
export async function generateWorkExperience(input: GenerateWorkExperienceInput) {
  const { userId } = await auth(); // Retrieve the authenticated user's ID

  if (!userId) {
    throw new Error("Unauthorized"); // Ensure the user is logged in
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId); // Check subscription level

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature"); // Validate access rights
  }

  // Parse and validate the input description
  const { description } = generateWorkExperienceSchema.parse(input);

  // Define system and user messages for the AI model
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
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
  });

  const aiResponse = completion.choices[0].message.content; // Extract AI response

  if (!aiResponse) {
    throw new Error("Failed to generate AI response"); // Ensure a response is received
  }

  console.log("aiResponse", aiResponse); // Log the raw AI response

  // Extract relevant fields using regular expressions
  return {
    position: aiResponse.match(/Job title: (.*)/)?.[1] || "",
    company: aiResponse.match(/Company: (.*)/)?.[1] || "",
    description: (aiResponse.match(/Description:([\s\S]*)/)?.[1] || "").trim(),
    startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
  } satisfies WorkExperience;
}
