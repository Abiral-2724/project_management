/*
  Warnings:

  - You are about to drop the column `userId` on the `Project_Members` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Project_Members" DROP CONSTRAINT "Project_Members_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Project_Members" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "public"."Project_Members" ADD CONSTRAINT "Project_Members_email_fkey" FOREIGN KEY ("email") REFERENCES "public"."User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
