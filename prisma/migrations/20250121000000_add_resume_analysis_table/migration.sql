-- CreateTable
CREATE TABLE "resume_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pdfFileUrl" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "analysisResult" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_analyses_userId_idx" ON "resume_analyses"("userId");

-- CreateIndex
CREATE INDEX "resume_analyses_status_idx" ON "resume_analyses"("status");

-- CreateIndex
CREATE INDEX "resume_analyses_createdAt_idx" ON "resume_analyses"("createdAt"); 