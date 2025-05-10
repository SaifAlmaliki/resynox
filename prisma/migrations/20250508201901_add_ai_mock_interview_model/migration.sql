-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "questions" TEXT[],
    "techstack" TEXT[],
    "type" TEXT NOT NULL,
    "finalized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "strengths" TEXT[],
    "areasForImprovement" TEXT[],
    "finalAssessment" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
