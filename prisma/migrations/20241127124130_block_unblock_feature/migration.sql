-- AlterTable
ALTER TABLE "ArticleHistory" ALTER COLUMN "content" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;
