/*
  Warnings:

  - You are about to drop the column `isScam` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `scamExpiresAt` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `scamProof` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `scamReason` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "isScam",
DROP COLUMN "scamExpiresAt",
DROP COLUMN "scamProof",
DROP COLUMN "scamReason";

-- CreateTable
CREATE TABLE "ScamReport" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "proof" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedById" INTEGER NOT NULL,

    CONSTRAINT "ScamReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScamReport" ADD CONSTRAINT "ScamReport_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScamReport" ADD CONSTRAINT "ScamReport_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
