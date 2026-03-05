// routes/comments.routes.js
import express from "express";
import { addComment, deleteComment, editComment, getTaskComments } from "../controllers/comment.controllers.js";

const router = express.Router();

// POST   /api/v1/comments/:userId/:projectId/:taskId       → add comment
// GET    /api/v1/comments/task/:taskId                     → get task comments
// PATCH  /api/v1/comments/:commentId/user/:userId          → edit comment
// DELETE /api/v1/comments/:commentId/user/:userId          → delete comment

router.post("/:userId/:projectId/:taskId", addComment);
router.get("/task/:taskId", getTaskComments);
router.patch("/:commentId/user/:userId", editComment);
router.delete("/:commentId/user/:userId", deleteComment);

export default router;