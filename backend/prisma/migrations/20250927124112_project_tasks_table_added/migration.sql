/*
  Warnings:

  - You are about to drop the column `firstname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('Low', 'Medium', 'High');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "firstname",
DROP COLUMN "lastname",
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Project_Tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "assignee_id" TEXT NOT NULL,
    "priority" "public"."Priority" NOT NULL DEFAULT 'High',
    "deadline" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_Tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."Project_Tasks" ADD CONSTRAINT "Project_Tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project_Tasks" ADD CONSTRAINT "Project_Tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
