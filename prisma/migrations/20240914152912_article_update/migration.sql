/*
  Warnings:

  - You are about to drop the column `isActive` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `publishDate` on the `Article` table. All the data in the column will be lost.
  - Added the required column `subtitle` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "isActive",
DROP COLUMN "publishDate",
ADD COLUMN     "conclusion" TEXT,
ADD COLUMN     "subtitle" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePic" TEXT;
