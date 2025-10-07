/*
  Warnings:

  - Added the required column `project_sub_task_creator_id` to the `Project_SubTasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_task_creator_id` to the `Project_Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Project_SubTasks" ADD COLUMN     "project_sub_task_creator_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Project_Tasks" ADD COLUMN     "project_task_creator_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Project_Tasks" ADD CONSTRAINT "Project_Tasks_project_task_creator_id_fkey" FOREIGN KEY ("project_task_creator_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project_SubTasks" ADD CONSTRAINT "Project_SubTasks_project_sub_task_creator_id_fkey" FOREIGN KEY ("project_sub_task_creator_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
