/*
  Warnings:

  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "options" JSONB,
ADD COLUMN     "promoCode" TEXT,
ADD COLUMN     "question" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
