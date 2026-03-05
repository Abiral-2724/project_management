// routes/project.tasks.route.js
// Mounted at: app.use("/api/v1/task", tasksRoute)

import express from "express";
import {
  addTasks,
  addSubTasks,
  getmycreatedTask,
  getTaskAssignedoftheUser,
  getalltaskswiththeirsubtasks,
  markTaskComplete,
  markSubTaskComplete,
  editTasks,
  editsubTasks,
  projectDashboard,
} from "../controllers/tasks.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST   /api/v1/task/:userId/:projectId           → add tasks
router.post("/:userId/:projectId", authMiddleware, addTasks);

// POST   /api/v1/task/subtask/:userId/:projectId   → add subtasks
router.post("/subtask/:userId/:projectId", authMiddleware, addSubTasks);

// GET    /api/v1/task/my-created/:userId           → tasks created by user
router.get("/my-created/:userId", authMiddleware, getmycreatedTask);

// GET    /api/v1/task/assigned/:userId             → tasks assigned to user
router.get("/assigned/:userId", authMiddleware, getTaskAssignedoftheUser);

// GET    /api/v1/task/:userId/:projectId/all       → all tasks + subtasks for a project
router.get("/:userId/:projectId/all", authMiddleware, getalltaskswiththeirsubtasks);

// PATCH  /api/v1/task/complete/:userId/:projectId  → toggle task complete
router.patch("/complete/:userId/:projectId", authMiddleware, markTaskComplete);

// PATCH  /api/v1/task/subtask/complete/:userId/:projectId → toggle subtask complete
router.patch("/subtask/complete/:userId/:projectId", authMiddleware, markSubTaskComplete);

// PUT    /api/v1/task/edit/:userId/:projectId      → edit tasks (bulk)
router.put("/edit/:userId/:projectId", authMiddleware, editTasks);

// PUT    /api/v1/task/subtask/edit/:userId/:projectId → edit subtasks (bulk)
router.put("/subtask/edit/:userId/:projectId", authMiddleware, editsubTasks);

// GET    /api/v1/task/:userId/:projectId/dashboard → project dashboard analytics
router.get("/:userId/:projectId/dashboard", authMiddleware, projectDashboard);

export default router;