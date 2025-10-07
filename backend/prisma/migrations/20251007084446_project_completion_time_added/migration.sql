-- AlterTable
ALTER TABLE "public"."Project_SubTasks" ADD COLUMN     "time_SubTaskCompletion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Project_Tasks" ADD COLUMN     "time_TaskCompletion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
