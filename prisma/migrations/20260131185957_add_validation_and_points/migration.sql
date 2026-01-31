/*
  Warnings:

  - Added the required column `points` to the `Mission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "points" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PlayerMission" ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "validationStatus" TEXT NOT NULL DEFAULT 'not_started';
