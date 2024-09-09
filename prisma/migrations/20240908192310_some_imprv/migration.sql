/*
  Warnings:

  - Added the required column `updatedAt` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Referral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserAirdrop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Advertisement" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Referral" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserAirdrop" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
