/*
  Warnings:

  - You are about to drop the column `averageRating` on the `Article` table. All the data in the column will be lost.
  - Changed the type of `content` on the `Article` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "averageRating",
ADD COLUMN     "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
