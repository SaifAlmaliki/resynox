-- AlterTable
ALTER TABLE "user_subscriptions" ADD COLUMN     "pointsAllowance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "starterPointsGrantedAt" TIMESTAMP(3),
ADD COLUMN     "voiceInterviewsResetDate" TIMESTAMP(3),
ADD COLUMN     "voiceInterviewsUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "points_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "points_transactions_userId_createdAt_idx" ON "points_transactions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "cover_letters_userId_idx" ON "cover_letters"("userId");

-- CreateIndex
CREATE INDEX "cover_letters_resumeId_idx" ON "cover_letters"("resumeId");

-- CreateIndex
CREATE INDEX "interviews_userId_idx" ON "interviews"("userId");

-- CreateIndex
CREATE INDEX "interviews_createdAt_idx" ON "interviews"("createdAt");

-- CreateIndex
CREATE INDEX "resumes_userId_idx" ON "resumes"("userId");

-- CreateIndex
CREATE INDEX "resumes_updatedAt_idx" ON "resumes"("updatedAt");
