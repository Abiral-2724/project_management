/*
  Warnings:

  - You are about to drop the column `email` on the `Project_Members` table. All the data in the column will be lost.
  - Added the required column `emailuser` to the `Project_Members` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Project_Members" DROP CONSTRAINT "Project_Members_email_fkey";

-- AlterTable
ALTER TABLE "public"."Project_Members" DROP COLUMN "email",
ADD COLUMN     "emailuser" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Project_Members" ADD CONSTRAINT "Project_Members_emailuser_fkey" FOREIGN KEY ("emailuser") REFERENCES "public"."User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
