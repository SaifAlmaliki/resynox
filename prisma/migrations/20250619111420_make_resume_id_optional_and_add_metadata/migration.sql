-- AlterTable
ALTER TABLE "cover_letters" ADD COLUMN     "metadata" TEXT,
ALTER COLUMN "resumeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
