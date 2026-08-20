/*
  Warnings:

  - You are about to drop the column `isTop3` on the `TodayPriority` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TodayPriority" DROP COLUMN "isTop3",
ADD COLUMN     "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "xpReward" INTEGER NOT NULL DEFAULT 10;
