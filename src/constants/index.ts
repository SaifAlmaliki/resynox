// Schema for AI-generated feedback
export const feedbackSchema = {
  type: "object",
  properties: {
    totalScore: {
      type: "number",
      description: "Overall score from 0-100",
    },
    categoryScores: {
      type: "array",
      description: "Scores for each category",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Category name",
          },
          score: {
            type: "number",
            description: "Score from 0-100",
          },
          comment: {
            type: "string",
            description: "Detailed feedback for this category",
          },
        },
        required: ["name", "score", "comment"],
      },
    },
    strengths: {
      type: "array",
      description: "List of candidate strengths",
      items: {
        type: "string",
      },
    },
    areasForImprovement: {
      type: "array",
      description: "List of areas for improvement",
      items: {
        type: "string",
      },
    },
    finalAssessment: {
      type: "string",
      description: "Overall assessment and recommendations",
    },
  },
  required: [
    "totalScore",
    "categoryScores",
    "strengths",
    "areasForImprovement",
    "finalAssessment",
  ],
};

// VAPI Workflow ID for the interviewer
export const interviewer = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!;
