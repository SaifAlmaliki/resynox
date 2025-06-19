import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import openai from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { paragraph, jobDescription, context } = body;

    if (!paragraph || !jobDescription) {
      return new NextResponse("Paragraph and job description are required", { status: 400 });
    }

    // AI-powered enhancement using OpenAI
    const enhanceParagraph = async (originalParagraph: string, jobDesc: string, contextType: string) => {
      try {
        const enhancementPrompt = `
You are a professional career coach and expert writer. Please enhance the following cover letter text to make it more compelling, professional, and tailored to the job description.

Original Text:
"""
${originalParagraph}
"""

Job Description Context:
"""
${jobDesc}
"""

Context Type: ${contextType}

Instructions:
- Improve the language to be more professional and impactful
- Make it more specific and tailored to the job requirements
- Add relevant keywords and skills from the job description where appropriate
- Maintain the original meaning and tone while making it more compelling
- Use stronger action verbs and more specific terminology
- Ensure the enhanced version flows naturally
- Keep the same general structure and length
- Make it sound more confident and experienced
- Return ONLY the enhanced text, no additional formatting or explanations

Enhanced version:`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert career coach and professional writer who specializes in creating compelling cover letters. Always respond with only the enhanced text, no additional formatting or explanations."
            },
            {
              role: "user",
              content: enhancementPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500,
        });

        const enhancedText = response.choices[0]?.message?.content?.trim();
        
        if (!enhancedText) {
          throw new Error("No response from OpenAI");
        }

        return enhancedText;
      } catch (error) {
        console.error("Error enhancing with OpenAI:", error);
        return originalParagraph; // Return original if enhancement fails
      }
    };

    const enhancedParagraph = await enhanceParagraph(paragraph, jobDescription, context || 'standalone');

    return NextResponse.json({ 
      enhancedParagraph,
      originalParagraph: paragraph 
    });
  } catch (error) {
    console.error("[COVER_LETTER_ENHANCE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 