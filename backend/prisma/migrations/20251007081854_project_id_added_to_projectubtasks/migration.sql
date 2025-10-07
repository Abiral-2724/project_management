/*
  Warnings:

  - Added the required column `projectId` to the `Project_SubTasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Project_SubTasks" ADD COLUMN     "projectId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Project_SubTasks" ADD CONSTRAINT "Project_SubTasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
