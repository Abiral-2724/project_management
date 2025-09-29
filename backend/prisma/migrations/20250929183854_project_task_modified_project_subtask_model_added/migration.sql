/*
  Warnings:

  - You are about to drop the column `assignee_id` on the `Project_Tasks` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `Project_Tasks` table. All the data in the column will be lost.
  - Added the required column `assignee_email` to the `Project_Tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Project_Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Project_Tasks" DROP CONSTRAINT "Project_Tasks_assignee_id_fkey";

-- AlterTable
ALTER TABLE "public"."Project_Tasks" DROP COLUMN "assignee_id",
DROP COLUMN "deadline",
ADD COLUMN     "assignee_email" TEXT NOT NULL,
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mark_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Project_SubTasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" "public"."Priority" NOT NULL DEFAULT 'High',
    "project_Tasks_id" TEXT NOT NULL,
    "assignee_email" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mark_complete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_SubTasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Project_Tasks" ADD CONSTRAINT "Project_Tasks_assignee_email_fkey" FOREIGN KEY ("assignee_email") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project_SubTasks" ADD CONSTRAINT "Project_SubTasks_project_Tasks_id_fkey" FOREIGN KEY ("project_Tasks_id") REFERENCES "public"."Project_Tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
