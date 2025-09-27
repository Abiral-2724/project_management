-- CreateTable
CREATE TABLE "public"."ProjectViews" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "overview" BOOLEAN NOT NULL DEFAULT false,
    "Board" BOOLEAN NOT NULL DEFAULT false,
    "List" BOOLEAN NOT NULL DEFAULT true,
    "Timeline" BOOLEAN NOT NULL DEFAULT false,
    "Dashboard" BOOLEAN NOT NULL DEFAULT false,
    "Gantt" BOOLEAN NOT NULL DEFAULT false,
    "Calenar" BOOLEAN NOT NULL DEFAULT false,
    "Note" BOOLEAN NOT NULL DEFAULT false,
    "Workload" BOOLEAN NOT NULL DEFAULT false,
    "Files" BOOLEAN NOT NULL DEFAULT false,
    "Messages" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProjectViews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ProjectViews" ADD CONSTRAINT "ProjectViews_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
