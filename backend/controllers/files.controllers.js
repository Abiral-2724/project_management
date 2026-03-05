import { PrismaClient } from "@prisma/client";
import cloudinary from "../utils/cloudinary.js";
import { io } from "../index.js";
import { createActivityLog } from "./activity.controllers.js";

const client = new PrismaClient();

// ─── NOTIFICATION HELPER ──────────────────────────────────────────────────────
async function pushNotification({ userId, type, message, projectId = null, taskId = null }) {
  try {
    const notif = await client.notification.create({
      data: { user_id: userId, type, message, project_id: projectId, task_id: taskId },
    });
    io?.to(`user:${userId}`).emit("new_notification", notif);
  } catch (e) {
    console.warn("pushNotification failed:", e.message);
  }
}

// ─── UPLOAD FILE ──────────────────────────────────────────────────────────────
export const uploadfile = async (req, res) => {
  try {
    const { userId, projectId, taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      { folder: "project_files", resource_type: "auto" }
    );

    const projectfile = await client.projectFiles.create({
      data: {
        project_id: projectId,
        task_id: taskId,
        uploader_id: userId,
        file: result.secure_url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
      },
    });

    // ── Notify task assignee if they're not the uploader ─────────────────────
    const task = await client.project_Tasks.findFirst({ where: { id: taskId } });
    if (task && task.assignee_email) {
      const assignee = await client.user.findFirst({ where: { email: task.assignee_email } });
      if (assignee && assignee.id !== userId) {
        const uploader = await client.user.findFirst({ where: { id: userId } });
        await pushNotification({
          userId: assignee.id,
          type: "FILE_UPLOADED",
          message: `${uploader?.fullname || "Someone"} uploaded "${req.file.originalname}" to your task "${task.title}"`,
          projectId,
          taskId,
        });
      }
    }

    await createActivityLog({
      userId,
      projectId,
      taskId,
      action: "FILE_UPLOADED",
      meta: { fileName: req.file.originalname, taskTitle: task?.title || "" }
    });

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: projectfile,
    });
  } catch (e) {
    console.error("uploadfile:", e);
    return res.status(500).json({ success: false, message: "Error uploading file" });
  }
};

// ─── GET ALL FILES OF PROJECT ─────────────────────────────────────────────────
export const getAllFilesOfProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const files = await client.projectFiles.findMany({
      where: { project_id: projectId },
      orderBy: { uploadedAt: "desc" },
    });

    const filesDetail = await Promise.all(
      files.map(async (file) => {
        const project  = await client.projects.findFirst({ where: { id: file.project_id } });
        const uploader = await client.user.findFirst({ where: { id: file.uploader_id } });
        const task     = await client.project_Tasks.findFirst({ where: { id: file.task_id } });
        return {
          id: file.id,
          fileUrl: file.file,
          fileName: file.fileName || file.file.split("/").pop(),
          fileSize: file.fileSize || null,
          fileType: file.fileType || null,
          projectName: project?.projectName || "Unknown",
          uploaderName: uploader?.fullname || "Unknown",
          uploaderProfile: uploader?.profile || null,
          taskName: task?.title || "Unknown",
          uploadedAt: file.uploadedAt,
        };
      })
    );

    return res.status(200).json({ success: true, files: filesDetail });
  } catch (e) {
    console.error("getAllFilesOfProject:", e);
    return res.status(500).json({ success: false, message: "Error fetching files" });
  }
};

// ─── GET FILES OF TASK ────────────────────────────────────────────────────────
export const getAllFilesOfTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const files = await client.projectFiles.findMany({
      where: { task_id: taskId },
      orderBy: { uploadedAt: "desc" },
    });
    const filesDetail = await Promise.all(
      files.map(async (file) => {
        const uploader = await client.user.findFirst({
          where: { id: file.uploader_id },
          select: { fullname: true, profile: true, email: true },
        });
        return { ...file, uploader };
      })
    );
    return res.status(200).json({ success: true, files: filesDetail });
  } catch (e) {
    console.error("getAllFilesOfTask:", e);
    return res.status(500).json({ success: false, message: "Error fetching task files" });
  }
};

// ─── DELETE FILE ──────────────────────────────────────────────────────────────
export const deleteFile = async (req, res) => {
  try {
    const { fileId, userId } = req.params;

    const file = await client.projectFiles.findFirst({ where: { id: fileId } });
    if (!file) return res.status(404).json({ success: false, message: "File not found" });

    if (file.uploader_id !== userId) {
      const project = await client.projects.findFirst({ where: { id: file.project_id } });
      if (!project || project.ownerId !== userId) {
        return res.status(403).json({ success: false, message: "Not authorized to delete this file" });
      }
    }

    const publicId = file.file.split("/").slice(-2).join("/").split(".")[0];
    try { await cloudinary.uploader.destroy(publicId, { resource_type: "auto" }); }
    catch (err) { console.warn("Cloudinary delete:", err.message); }

    await client.projectFiles.delete({ where: { id: fileId } });
    return res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (e) {
    console.error("deleteFile:", e);
    return res.status(500).json({ success: false, message: "Error deleting file" });
  }
};