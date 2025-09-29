-- CreateTable
CREATE TABLE "public"."ProjectFiles" (
    "id" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectFiles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ProjectFiles" ADD CONSTRAINT "ProjectFiles_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectFiles" ADD CONSTRAINT "ProjectFiles_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."Project_Tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectFiles" ADD CONSTRAINT "ProjectFiles_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
