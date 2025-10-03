/*
  Warnings:

  - You are about to drop the column `Calenar` on the `ProjectViews` table. All the data in the column will be lost.
  - You are about to drop the column `overview` on the `ProjectViews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ProjectViews" DROP COLUMN "Calenar",
DROP COLUMN "overview",
ADD COLUMN     "Calendar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Overview" BOOLEAN NOT NULL DEFAULT false;
