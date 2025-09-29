/*
  Warnings:

  - Added the required column `email` to the `Project_Members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Project_Members" ADD COLUMN     "email" TEXT NOT NULL;
