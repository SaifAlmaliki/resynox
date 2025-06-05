export interface Feedback {
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
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Interview {
  id: string;
  userId: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  type: string;
  finalized: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
  additionalContext?: {
    role?: string;
    techstack?: string[];
    level?: string;
  };
}

export interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string | Date;
}

export interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
  role?: string;
  level?: string;
  techstack?: string[];
  experienceLevel?: string;
  interviewDuration?: string;
  specificFocus?: string;
  skipIntro?: boolean;
}

export interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

export interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

export interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

export interface TechIconProps {
  techStack: string[];
}

export enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  ERROR = "ERROR"
}

// Type of agent/interview being conducted
export type AgentType = "generate" | "interview" | "feedback";

export interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

export interface InterviewEvaluationCriteria {
  technicalKnowledge: number;
  problemSolving: number;
  communication: number;
  culturalFit: number;
  confidence: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}
