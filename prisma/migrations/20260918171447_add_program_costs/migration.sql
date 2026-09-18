/*
  Warnings:

  - You are about to drop the column `currency` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `tuition` on the `Program` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Program" DROP COLUMN "currency",
DROP COLUMN "tuition";

-- CreateTable
CREATE TABLE "ProgramCost" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "tuitionYear1" DOUBLE PRECISION,
    "tuitionYear2" DOUBLE PRECISION,
    "livingCostYear1" DOUBLE PRECISION,
    "livingCostYear2" DOUBLE PRECISION,
    "healthInsurance" DOUBLE PRECISION,
    "applicationFee" DOUBLE PRECISION,
    "visaFee" DOUBLE PRECISION,
    "booksAndSupplies" DOUBLE PRECISION,
    "otherFees" DOUBLE PRECISION,
    "otherFeesNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCost_programId_key" ON "ProgramCost"("programId");

-- AddForeignKey
ALTER TABLE "ProgramCost" ADD CONSTRAINT "ProgramCost_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
