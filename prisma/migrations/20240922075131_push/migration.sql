/*
  Warnings:

  - You are about to drop the column `views` on the `Airdrop` table. All the data in the column will be lost.
  - The primary key for the `AirdropView` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AirdropView` table. All the data in the column will be lost.
  - You are about to drop the column `conclusion` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `Article` table. All the data in the column will be lost.
  - The primary key for the `ArticleView` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ArticleView` table. All the data in the column will be lost.
  - You are about to drop the column `profilePic` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `UserAirdrop` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserAirdrop` table. All the data in the column will be lost.
  - Added the required column `airdropId` to the `Referral` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_createdBy_fkey";

-- DropIndex
DROP INDEX "AirdropView_userId_airdropId_key";

-- DropIndex
DROP INDEX "ArticleView_userId_articleId_key";

-- DropIndex
DROP INDEX "Referral_referralLink_key";

-- AlterTable
ALTER TABLE "Airdrop" DROP COLUMN "views";

-- AlterTable
ALTER TABLE "AirdropView" DROP CONSTRAINT "AirdropView_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "AirdropView_pkey" PRIMARY KEY ("userId", "airdropId");

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "conclusion",
DROP COLUMN "createdBy",
DROP COLUMN "views",
ADD COLUMN     "authorId" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publishDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Draft',
ALTER COLUMN "subtitle" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ArticleView" DROP CONSTRAINT "ArticleView_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ArticleView_pkey" PRIMARY KEY ("userId", "articleId");

-- AlterTable
ALTER TABLE "Referral" ADD COLUMN     "airdropId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePic";

-- AlterTable
ALTER TABLE "UserAirdrop" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "ArticleVersion" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleMedia" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "ArticleMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "Airdrop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersion" ADD CONSTRAINT "ArticleVersion_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleMedia" ADD CONSTRAINT "ArticleMedia_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
