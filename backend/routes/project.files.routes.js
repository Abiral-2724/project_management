// routes/project.files.routes.js
// Mounted at: app.use("/api/v1/files", filesRoute)

import express from "express";
import {
  uploadfile,
  getAllFilesOfProject,
  getAllFilesOfTask,
  deleteFile,
} from "../controllers/files.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import  upload  from "../middlewares/multer.js";

const router = express.Router();

// POST   /api/v1/files/upload/:userId/:projectId/:taskId
router.post("/upload/:userId/:projectId/:taskId", authMiddleware, upload.single("file"), uploadfile);

// GET    /api/v1/files/project/:projectId
router.get("/project/:projectId", authMiddleware, getAllFilesOfProject);

// GET    /api/v1/files/task/:taskId
router.get("/task/:taskId", authMiddleware, getAllFilesOfTask);

// DELETE /api/v1/files/:fileId/user/:userId
router.delete("/:fileId/user/:userId", authMiddleware, deleteFile);

export default router;