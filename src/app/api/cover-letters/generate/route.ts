import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import openai from "@/lib/openai";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { canUseAITools } from "@/lib/permissions";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check subscription level for AI tools
    const subscriptionLevel = await getUserSubscriptionLevel(userId);
    if (!canUseAITools(subscriptionLevel)) {
      return new NextResponse("Please upgrade your subscription to use AI tools", { status: 403 });
    }

    const body = await req.json();
    const { resumeId, jobDescription, basicInfo } = body;

    if (!jobDescription) {
      return new NextResponse("Job description is required", { status: 400 });
    }

    // Validate that either resumeId or basicInfo is provided
    if (!resumeId && !basicInfo) {
      return new NextResponse("Either resume ID or basic info is required", { status: 400 });
    }

    let resume = null;
    let userInfo = null;

    if (resumeId) {
      // Fetch the resume data to use in the cover letter
      resume = await db.resume.findUnique({
        where: { id: resumeId },
        include: {
          workExperiences: true,
          educations: true,
        },
      });

      if (!resume) {
        return new NextResponse("Resume not found", { status: 404 });
      }
    } else {
      // Use basic info provided by user
      userInfo = basicInfo;
      
      // Validate basic info
      if (!userInfo.firstName || !userInfo.lastName || !userInfo.email) {
        return new NextResponse("First name, last name, and email are required", { status: 400 });
      }
    }

    // AI-powered job description analysis using OpenAI
    const analyzeJobDescription = async (jobDesc: string) => {
      try {
        const analysisPrompt = `
Analyze the following job description and extract key information. Pay special attention to company names with special characters, accents, or non-English letters (like TÜV SÜD, Nestlé, etc.).

Job Description:
"""
${jobDesc}
"""

Please extract and return ONLY a valid JSON object with the following structure:
{
  "jobTitle": "exact job title from the posting",
  "companyName": "exact company name (preserve all special characters, accents, symbols like TÜV SÜD)",
  "keyResponsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
  "requiredSkills": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5"],
  "experienceRequired": "minimum years of experience required or specific experience level",
  "companyMission": "company mission, values, or what they do briefly",
  "location": "job location if mentioned",
  "degreeRequirement": "required education level or field of study",
  "workArrangement": "remote/hybrid/onsite preference if mentioned",
  "hiringManagerName": "hiring manager name if mentioned, otherwise 'Hiring Manager'",
  "companyAddress": "company address if mentioned"
}

Instructions:
- Extract the EXACT company name preserving all special characters, accents, and formatting
- For job title, use the exact title from the posting, not a generic version
- Focus on the most important and specific requirements
- Look for minimum experience requirements (e.g., "5+ years", "minimum 3 years")
- Include technical skills, soft skills, and specific tools/technologies mentioned
- If information is not clearly stated, use "Not specified" for that field
- Ensure the JSON is valid and properly formatted
`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert at analyzing job descriptions and extracting structured information. Always return valid JSON only, no additional text or formatting."
            },
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
        });

        const analysisText = response.choices[0]?.message?.content?.trim();
        if (!analysisText) {
          throw new Error("No response from OpenAI");
        }

        // Parse the JSON response
        const jobAnalysis = JSON.parse(analysisText);
        
        // Validate and provide defaults for critical fields
        return {
          jobTitle: jobAnalysis.jobTitle || "this position",
          companyName: jobAnalysis.companyName || "your organization",
          keyResponsibilities: Array.isArray(jobAnalysis.keyResponsibilities) ? jobAnalysis.keyResponsibilities.slice(0, 3) : [],
          requiredSkills: Array.isArray(jobAnalysis.requiredSkills) ? jobAnalysis.requiredSkills.slice(0, 5) : [],
          experienceRequired: jobAnalysis.experienceRequired || "Not specified",
          companyMission: jobAnalysis.companyMission || "Not specified",
          location: jobAnalysis.location || "Not specified",
          degreeRequirement: jobAnalysis.degreeRequirement || "Not specified",
          workArrangement: jobAnalysis.workArrangement || "Not specified",
          hiringManagerName: jobAnalysis.hiringManagerName || "Hiring Manager",
          companyAddress: jobAnalysis.companyAddress || ""
        };
      } catch (error) {
        console.error("Error analyzing job description with OpenAI:", error);
        
        // Simple fallback if OpenAI analysis fails
        return {
          jobTitle: "this position",
          companyName: "your organization", 
          keyResponsibilities: [],
          requiredSkills: [],
          experienceRequired: "Not specified",
          companyMission: "Not specified",
          location: "Not specified",
          degreeRequirement: "Not specified",
          workArrangement: "Not specified",
          hiringManagerName: "Hiring Manager",
          companyAddress: ""
        };
      }
    };

    // Analyze the job description
    const jobAnalysis = await analyzeJobDescription(jobDescription);

    // Generate tailored cover letter using OpenAI
    const generateTailoredCoverLetter = async (analysis: any, resume: any, userInfo: any) => {
      try {
        let contextPrompt = "";
        
        if (resume) {
          // Build resume context
          const workExperience = resume.workExperiences?.length > 0 
            ? resume.workExperiences.map((exp: any) => `${exp.position} at ${exp.company}: ${exp.description || ''}`).join('\n')
            : 'No work experience provided';
          
          const education = resume.educations?.length > 0
            ? resume.educations.map((edu: any) => `${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution}`).join('\n')
            : 'No education provided';

          contextPrompt = `
Resume Information:
Name: ${resume.firstName} ${resume.lastName}
Email: ${resume.email || 'Not provided'}
Phone: ${resume.phone || 'Not provided'}
City: ${resume.city || 'Not provided'}
Country: ${resume.country || 'Not provided'}
Current Role: ${resume.jobTitle || 'Not specified'}
Summary: ${resume.summary || 'Not provided'}
Skills: ${resume.skills?.join(', ') || 'Not specified'}

Work Experience:
${workExperience}

Education:
${education}
`;
        } else {
          contextPrompt = `
Applicant Information:
Name: ${userInfo.firstName} ${userInfo.lastName}
Email: ${userInfo.email}
Phone: ${userInfo.phone || 'Not provided'}
Address: ${userInfo.address || 'Not provided'}
City: ${userInfo.city || 'Not provided'}
State: ${userInfo.state || 'Not provided'}
ZIP Code: ${userInfo.zipCode || 'Not provided'}
`;
        }

        // Get current date
        const currentDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const coverLetterPrompt = `
Write a professional, compelling cover letter with proper business letter formatting based on the following information:

${contextPrompt}

Job Information:
Position: ${analysis.jobTitle}
Company: ${analysis.companyName}
Location: ${analysis.location}
Experience Required: ${analysis.experienceRequired}
Key Responsibilities: ${analysis.keyResponsibilities.join(', ')}
Required Skills: ${analysis.requiredSkills.join(', ')}
Education Requirement: ${analysis.degreeRequirement}
Company Mission: ${analysis.companyMission}
Work Arrangement: ${analysis.workArrangement}
Hiring Manager: ${analysis.hiringManagerName}
Company Address: ${analysis.companyAddress}

Current Date: ${currentDate}

Instructions:
1. Format as a proper business letter with the following structure:
   - Applicant's contact information at the top (use ACTUAL information provided, no placeholders)
   - Date: ${currentDate}
   - Company name and address (if available)
   - Professional greeting using ${analysis.hiringManagerName === 'Hiring Manager' ? '"Dear Hiring Manager,"' : '"Dear ' + analysis.hiringManagerName + ',"'}
   
2. Create a cohesive, flowing cover letter body without bullet points or segmented sections
3. Express genuine interest in the specific role and company
4. ${resume ? 'Highlight relevant experience and skills from the resume that match the job requirements' : 'Express enthusiasm and potential fit for the role'}
5. Reference the company by name and show knowledge of what they do
6. Connect the applicant's background to the specific job requirements
7. Mention 2-3 most relevant skills or experiences that align with the job
8. Show enthusiasm for the company's mission and values
9. End with a professional closing and signature
10. Keep it concise but impactful (3-4 paragraphs for the body)
11. Make it feel personal and tailored, not generic
12. Use the exact company name and job title provided
13. CRITICAL: Use ONLY the actual contact information provided in the context. Never use placeholders like [Your Address], [Email Address], [Phone Number] etc.
14. ${resume ? 'For the applicant address section, format it as: Name, City, Country (if provided), Email, Phone' : 'Use the actual basic info provided'}
15. If specific contact information is not available, omit that field entirely rather than using placeholders
`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert career coach and writer who creates compelling, personalized cover letters. Write in a professional but warm tone that shows genuine interest and creates a strong connection between the applicant and the role."
            },
            {
              role: "user",
              content: coverLetterPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 800,
        });

        return response.choices[0]?.message?.content?.trim() || "";
      } catch (error) {
        console.error("Error generating cover letter with OpenAI:", error);
        
        // Fallback to basic template
        const applicantName = resume ? `${resume.firstName} ${resume.lastName}` : `${userInfo.firstName} ${userInfo.lastName}`;
        const currentDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        // Format applicant contact information
        let applicantContactInfo = "";
        if (resume) {
          // Use resume data
          applicantContactInfo = `${resume.firstName} ${resume.lastName}
${resume.city ? resume.city : ''}${resume.country ? `, ${resume.country}` : ''}
${resume.email ? resume.email : ''}
${resume.phone ? resume.phone : ''}

`;
        } else if (userInfo) {
          // Use basic info provided
          applicantContactInfo = `${userInfo.firstName} ${userInfo.lastName}
${userInfo.address ? userInfo.address : ''}
${userInfo.city}${userInfo.state ? `, ${userInfo.state}` : ''}${userInfo.zipCode ? ` ${userInfo.zipCode}` : ''}
${userInfo.email}
${userInfo.phone ? userInfo.phone : ''}

`;
        }
        
        // Format company address
        let companyAddress = "";
        if (analysis.companyAddress) {
          companyAddress = `${analysis.companyName}
${analysis.companyAddress}

`;
        } else {
          companyAddress = `${analysis.companyName}

`;
        }
        
        return `${applicantContactInfo}${currentDate}

${companyAddress}Dear ${analysis.hiringManagerName},

I am writing to express my strong interest in the ${analysis.jobTitle} position at ${analysis.companyName}. ${analysis.companyMission !== "Not specified" ? `I am impressed by ${analysis.companyName}'s commitment to ${analysis.companyMission.toLowerCase()} and` : ""} I am excited about the opportunity to contribute to your team.

${resume?.summary || `With my background and enthusiasm for this field, I believe I would be a valuable addition to your ${analysis.jobTitle} team.`} ${analysis.experienceRequired !== "Not specified" ? `I understand that you are looking for someone with ${analysis.experienceRequired.toLowerCase()} of experience, and I am eager to bring my skills and dedication to this role.` : ""}

${analysis.requiredSkills.length > 0 ? `I am particularly drawn to this position because of my interests in ${analysis.requiredSkills.slice(0, 3).join(", ").toLowerCase()}, which align perfectly with the key requirements for the ${analysis.jobTitle} role.` : ""} ${analysis.location !== "Not specified" ? `The opportunity to work ${analysis.location} is also very appealing to me.` : ""}

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to ${analysis.companyName}'s continued success. Thank you for considering my application.

Best regards,
${applicantName}${resume?.email ? `\n${resume.email}` : userInfo?.email ? `\n${userInfo.email}` : ""}${resume?.phone ? `\n${resume.phone}` : userInfo?.phone ? `\n${userInfo.phone}` : ""}`;
      }
    };

    const coverLetter = await generateTailoredCoverLetter(jobAnalysis, resume, userInfo);

    if (!coverLetter || coverLetter.trim().length === 0) {
      console.error("Empty cover letter generated");
      return new NextResponse("Failed to generate cover letter content", { status: 500 });
    }

    return NextResponse.json({ content: coverLetter });
  } catch (error) {
    console.error("[COVER_LETTER_GENERATE]", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return new NextResponse("AI service configuration error", { status: 500 });
      } else if (error.message.includes("rate limit") || error.message.includes("quota")) {
        return new NextResponse("AI service temporarily unavailable. Please try again in a few minutes.", { status: 429 });
      } else if (error.message.includes("Unauthorized")) {
        return new NextResponse("Please upgrade your subscription to use AI tools", { status: 403 });
      }
      return new NextResponse(`Generation failed: ${error.message}`, { status: 500 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
} 