/*
  Warnings:

  - The primary key for the `Projects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `projectId` on the `Projects` table. All the data in the column will be lost.
  - The required column `id` was added to the `Projects` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."Projects" DROP CONSTRAINT "Projects_pkey",
DROP COLUMN "projectId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Projects_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."Project_Members" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Project_Members_pkey" PRIMARY KEY ("id")
);
