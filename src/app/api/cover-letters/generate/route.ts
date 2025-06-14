import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { resumeId, jobDescription } = body;

    if (!resumeId || !jobDescription) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Fetch the resume data to use in the cover letter
    const resume = await db.resume.findUnique({
      where: { id: resumeId },
      include: {
        workExperiences: true,
        educations: true,
      },
    });

    if (!resume) {
      return new NextResponse("Resume not found", { status: 404 });
    }

    // AI-powered job description analysis
    const analyzeJobDescription = async (jobDesc: string) => {
      const analysisPrompt = `
Analyze the following job description and extract key information in JSON format:

Job Description:
"""
${jobDesc}
"""

Please extract and return ONLY a valid JSON object with the following structure:
{
  "jobTitle": "extracted job title",
  "companyName": "extracted company name or 'Unknown' if not found",
  "keyResponsibilities": ["responsibility 1", "responsibility 2", "responsibility 3"],
  "requiredSkills": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5"],
  "companyGoals": "brief description of company mission/goals or 'Not specified' if not found",
  "experienceLevel": "entry/mid/senior level or 'Not specified'",
  "workType": "remote/hybrid/onsite or 'Not specified'"
}

Focus on extracting the most relevant information. If any field cannot be determined, use appropriate default values.
`;

      try {
        // Using a simple AI analysis approach
        // In a real implementation, you would use OpenAI, Claude, or another AI service
        // For now, we'll create a structured analysis based on common patterns
        
        const jobDescLower = jobDesc.toLowerCase();
        
        // Extract job title (improved logic)
        let jobTitle = "this position";
        const titlePatterns = [
          /(?:position|role|job title|title|we are looking for a|seeking a|hiring a|join us as a|apply for)\s*:?\s*([^\n\r,.!?]+)/i,
          /^([A-Z][a-zA-Z\s\-()]+(?:Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Assistant|Director|Lead|Senior|Junior|Architect|Consultant|Administrator|Technician))/,
        ];
        
        for (const pattern of titlePatterns) {
          const match = jobDesc.match(pattern);
          if (match && match[1]) {
            jobTitle = match[1].trim().replace(/[^\w\s\-()]/g, '');
            break;
          }
        }

        // Extract company name
        let companyName = "your organization";
        const companyPatterns = [
          /(?:company|organization|firm|at|join)\s*:?\s*([A-Z][a-zA-Z\s&.,\-()]{2,40})(?:\s*(?:is|are|seeks|looking|hiring|invites|offers))/i,
          /([A-Z][a-zA-Z\s&.,\-()]{2,40})(?:\s+(?:is|are)\s+(?:seeking|looking|hiring|searching))/,
        ];
        
        for (const pattern of companyPatterns) {
          const match = jobDesc.match(pattern);
          if (match && match[1]) {
            companyName = match[1].trim().replace(/[^\w\s&.,\-()]/g, '');
            break;
          }
        }

        // Extract responsibilities
        const responsibilities: string[] = [];
        const lines = jobDesc.split('\n');
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.match(/^[•\-\*]\s*/) || 
              trimmedLine.toLowerCase().includes('responsible for') ||
              trimmedLine.toLowerCase().includes('will be') ||
              trimmedLine.toLowerCase().includes('you will')) {
            if (trimmedLine.length > 10 && trimmedLine.length < 150) {
              responsibilities.push(trimmedLine.replace(/^[•\-\*]\s*/, ''));
            }
          }
        }

        // Extract skills
        const techKeywords = [
          'Azure', 'AWS', 'Cloud', 'Docker', 'Kubernetes', 'Python', 'Java', 'JavaScript', 'React', 'Node.js',
          'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Git', 'CI/CD', 'DevOps', 'Microservices',
          'API', 'REST', 'GraphQL', 'Machine Learning', 'AI', 'Data Science', 'Analytics', 'Tableau',
          'Power BI', 'Salesforce', 'SAP', 'Oracle', 'Microsoft', 'Linux', 'Windows', 'Agile', 'Scrum'
        ];
        
        const requiredSkills: string[] = [];
        for (const skill of techKeywords) {
          if (jobDescLower.includes(skill.toLowerCase())) {
            requiredSkills.push(skill);
          }
        }

        // Extract company goals/mission
        let companyGoals = "Not specified";
        if (jobDescLower.includes('mission') || jobDescLower.includes('vision') || jobDescLower.includes('goal')) {
          const goalMatch = jobDesc.match(/(?:mission|vision|goal|purpose)[^.!?]*[.!?]/i);
          if (goalMatch) {
            companyGoals = goalMatch[0].trim();
          }
        }

        // Determine experience level
        let experienceLevel = "Not specified";
        if (jobDescLower.includes('senior') || jobDescLower.includes('lead')) {
          experienceLevel = "senior";
        } else if (jobDescLower.includes('junior') || jobDescLower.includes('entry')) {
          experienceLevel = "entry";
        } else if (jobDescLower.includes('mid') || jobDescLower.includes('intermediate')) {
          experienceLevel = "mid";
        }

        // Determine work type
        let workType = "Not specified";
        if (jobDescLower.includes('remote')) {
          workType = "remote";
        } else if (jobDescLower.includes('hybrid')) {
          workType = "hybrid";
        } else if (jobDescLower.includes('onsite') || jobDescLower.includes('on-site')) {
          workType = "onsite";
        }

        return {
          jobTitle,
          companyName,
          keyResponsibilities: responsibilities.slice(0, 3),
          requiredSkills: requiredSkills.slice(0, 5),
          companyGoals,
          experienceLevel,
          workType
        };
      } catch (error) {
        console.error("Error analyzing job description:", error);
        return {
          jobTitle: "this position",
          companyName: "your organization",
          keyResponsibilities: [],
          requiredSkills: [],
          companyGoals: "Not specified",
          experienceLevel: "Not specified",
          workType: "Not specified"
        };
      }
    };

    // Analyze the job description
    const jobAnalysis = await analyzeJobDescription(jobDescription);

    // Find matching skills between resume and job requirements
    const matchingSkills = resume.skills?.filter(skill => 
      jobAnalysis.requiredSkills.some(jobSkill => 
        skill.toLowerCase().includes(jobSkill.toLowerCase()) || 
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    ) || [];

    // Generate a highly tailored cover letter
    const coverLetter = `
Dear Hiring Manager,

I am writing to express my strong interest in the ${jobAnalysis.jobTitle} position at ${jobAnalysis.companyName}. With my background as ${resume.jobTitle || "a professional in this field"}, I am excited about the opportunity to contribute to your team.

${resume.summary || "I bring extensive experience and expertise to this role."}

Based on my analysis of the ${jobAnalysis.jobTitle} role, I believe my experience aligns perfectly with your requirements:

${resume.workExperiences && resume.workExperiences.length > 0 
  ? `• In my role as ${resume.workExperiences[0].position} at ${resume.workExperiences[0].company}, I developed expertise in ${jobAnalysis.requiredSkills.length > 0 ? jobAnalysis.requiredSkills.slice(0, 2).join(' and ') : 'key technologies'} that are essential for success in the ${jobAnalysis.jobTitle} position.`
  : `• My professional experience has equipped me with the skills necessary for the ${jobAnalysis.jobTitle} role.`
}

${matchingSkills.length > 0 
  ? `• My technical expertise includes: ${matchingSkills.slice(0, 4).join(", ")}, which directly align with the requirements for the ${jobAnalysis.jobTitle} position.`
  : resume.skills && resume.skills.length > 0 
    ? `• My technical skills include: ${resume.skills.slice(0, 4).join(", ")}, which are valuable for the ${jobAnalysis.jobTitle} role.`
    : ""
}

${jobAnalysis.keyResponsibilities.length > 0 
  ? `• I am particularly excited about the opportunity to ${jobAnalysis.keyResponsibilities[0].toLowerCase().replace(/^(you will|will be|responsible for)\s*/i, '')} as outlined in the ${jobAnalysis.jobTitle} role.`
  : `• I am particularly excited about contributing to ${jobAnalysis.companyName}'s mission in the ${jobAnalysis.jobTitle} capacity.`
}

${jobAnalysis.companyGoals !== "Not specified" 
  ? `• I am drawn to ${jobAnalysis.companyName} because of your commitment to ${jobAnalysis.companyGoals.toLowerCase()}.`
  : ""
}

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to your team's success in the ${jobAnalysis.jobTitle} role. Thank you for considering my application.

Best regards,
${resume.firstName || ""} ${resume.lastName || ""}
    `.trim();

    return NextResponse.json({ content: coverLetter });
  } catch (error) {
    console.error("[COVER_LETTER_GENERATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 