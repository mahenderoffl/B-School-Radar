-- CreateEnum
CREATE TYPE "ScholarshipPlanStage" AS ENUM ('INTERESTED', 'PREPARING', 'APPLIED', 'AWARDED', 'REJECTED');

-- CreateTable
CREATE TABLE "SavedScholarship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "url" TEXT,
    "amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "coverage" TEXT,
    "deadlineDate" TIMESTAMP(3),
    "eligibility" TEXT,
    "schoolId" TEXT,
    "status" "ScholarshipPlanStage" NOT NULL DEFAULT 'INTERESTED',
    "taskChecklist" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedScholarship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedScholarship" ADD CONSTRAINT "SavedScholarship_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
