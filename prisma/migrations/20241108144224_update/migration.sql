/*
  Warnings:

  - The `status` column on the `Article` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'MODERATED', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "isEditorChoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduledPublishDate" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "ArticleHistory" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArticleHistory" ADD CONSTRAINT "ArticleHistory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
