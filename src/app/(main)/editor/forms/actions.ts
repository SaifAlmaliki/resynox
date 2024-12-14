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

export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth();
  // Retrieve the authenticated user's ID

  if (!userId) {
    // If no user ID is found, throw an error, indicating that the user is not authenticated
    throw new Error("Unauthorized");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  // Get the user's current subscription level to determine access to AI tools

  if (!canUseAITools(subscriptionLevel)) {
    // If the user doesn't have the required subscription level to access AI tools, throw an error
    throw new Error("Upgrade your subscription to use this feature");
  }

  // Validate and parse the input data against the defined schema
  const { jobTitle, workExperiences, educations, skills } = generateSummarySchema.parse(input);

  // Define a system message for the AI model. This sets the context and instructs the AI on the style and format of the output.
  const systemMessage = `
    You are a job resume generator AI. Your task is to write a professional introduction summary for a resume given the user's provided data.
    Only return the summary and do not include any other information in the response. Keep it concise and professional.
    `;

  // Construct a user message with the given input data. This message is what the AI will use to generate the summary.
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

  // Use the OpenAI API to create a chat completion. Here we provide the system and user messages.
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const aiResponse = completion.choices[0].message.content;
  // Extract the generated summary from the API response

  if (!aiResponse) {
    // If no AI response is returned, throw an error
    throw new Error("Failed to generate AI response");
  }

  return aiResponse;
}
//---------------------------------------------------------------------------
export async function generateWorkExperience(
  input: GenerateWorkExperienceInput,
) {
  // Retrieve the authenticated user's ID
  const { userId } = await auth();

  if (!userId) {
    // If no user is logged in, throw an error
    throw new Error("Unauthorized");
  }

  // Check the user's subscription level
  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    // If the user does not have the required subscription level, throw an error
    throw new Error("Upgrade your subscription to use this feature");
  }

  // Validate and parse the input description for generating the work experience
  const { description } = generateWorkExperienceSchema.parse(input);

  // Define a system message that instructs the AI to produce a structured work experience entry
  const systemMessage = `
  You are a job resume generator AI. Your task is to generate a single work experience entry based on the user input.
  Your response must adhere to the following structure. You can omit fields if they can't be inferred from the provided data, but don't add any new ones.

  Job title: <job title>
  Company: <company name>
  Start date: <format: YYYY-MM-DD> (only if provided)
  End date: <format: YYYY-MM-DD> (only if provided)
  Description: <an optimized description in bullet format, might be inferred from the job title>
  `;

  // Provide the user description from which the AI should infer a work experience entry
  const userMessage = `
  Please provide a work experience entry from this description:
  ${description}
  `;

  // Use the OpenAI API to generate a structured work experience entry
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const aiResponse = completion.choices[0].message.content;
  // Extract the generated work experience information from the AI response

  if (!aiResponse) {
    // If the AI doesn't provide any response, throw an error
    throw new Error("Failed to generate AI response");
  }

  console.log("aiResponse", aiResponse);
  // Log the raw AI response for debugging purposes

  // Use regular expressions to extract relevant fields from the AI response
  return {
    position: aiResponse.match(/Job title: (.*)/)?.[1] || "",
    company: aiResponse.match(/Company: (.*)/)?.[1] || "",
    description: (aiResponse.match(/Description:([\s\S]*)/)?.[1] || "").trim(),
    startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
  } satisfies WorkExperience;
}
