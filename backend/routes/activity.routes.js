// routes/activity.routes.js
import express from "express";
import { getProjectActivityLogs, getTaskActivityLogs, getUserActivityLogs } from "../controllers/activity.controllers.js";

const router = express.Router();

router.get("/project/:projectId", getProjectActivityLogs);
router.get("/task/:taskId", getTaskActivityLogs);
router.get("/user/:userId", getUserActivityLogs);

export default router;