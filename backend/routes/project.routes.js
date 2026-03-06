// routes/project.routes.js
// Mounted at: app.use("/api/v1", projectRoute)
// All routes match what api.js calls exactly

import express from "express";
import {
  createNewProject,
  getAllProjectsOfUser,
  getProjectById,
  getAllMemberOfProject,
  getViewsOfProject,
  getCompleteDetailOfProject,
  getProjectTimeline,
  sendingInviteToAddMemberToProject,
  updateRole,
  sendDigestToMembers,
} from "../controllers/project.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST   /api/v1/project/:userid           → create project
router.post("/project/:userid", authMiddleware, createNewProject);

// GET    /api/v1/projects/:userid          → get all projects of user
router.get("/projects/:userid", authMiddleware, getAllProjectsOfUser);

// GET    /api/v1/project/:projectId        → get project by id
router.get("/project/:projectId", authMiddleware, getProjectById);

// GET    /api/v1/project/:projectId/members
router.get("/project/:projectId/members", authMiddleware, getAllMemberOfProject);

// GET    /api/v1/project/:projectId/views
router.get("/project/:projectId/views", authMiddleware, getViewsOfProject);

// GET    /api/v1/project/:userId/:projectId/detail
router.get("/project/:userId/:projectId/detail", authMiddleware, getCompleteDetailOfProject);

// GET    /api/v1/project/:userId/:projectId/timeline
router.get("/project/:userId/:projectId/timeline", authMiddleware, getProjectTimeline);

// POST   /api/v1/project/:userId/:projectId/invite
router.post("/project/:userId/:projectId/invite", authMiddleware, sendingInviteToAddMemberToProject);

// PATCH  /api/v1/project/:projectId/role
router.patch("/project/:projectId/role", authMiddleware, updateRole);

router.post("/project/:userId/:projectId/send-digest", authMiddleware, sendDigestToMembers);

export default router;