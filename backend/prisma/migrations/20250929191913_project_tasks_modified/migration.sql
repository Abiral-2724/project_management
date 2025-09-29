-- DropForeignKey
ALTER TABLE "public"."Project_Tasks" DROP CONSTRAINT "Project_Tasks_assignee_email_fkey";

-- AddForeignKey
ALTER TABLE "public"."Project_Tasks" ADD CONSTRAINT "Project_Tasks_assignee_email_fkey" FOREIGN KEY ("assignee_email") REFERENCES "public"."User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
