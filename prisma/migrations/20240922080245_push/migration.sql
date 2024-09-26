/*
  Warnings:

  - A unique constraint covering the columns `[referralLink]` on the table `Referral` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referralLink_key" ON "Referral"("referralLink");
