-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "isScam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scamExpiresAt" TIMESTAMP(3),
ADD COLUMN     "scamProof" TEXT,
ADD COLUMN     "scamReason" TEXT;
