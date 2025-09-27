-- CreateEnum
CREATE TYPE "public"."userRole" AS ENUM ('Team_member', 'Manager', 'Director', 'Executive', 'Business_owner', 'Freelancer', 'Student', 'Other', 'Prefer_not_to_say', 'NONE');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "myRole" "public"."userRole" NOT NULL DEFAULT 'NONE';
