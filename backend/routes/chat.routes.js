// routes/chat.routes.js
import express from "express";
import { deleteMessage, editMessage, getChatHistory } from "../controllers/chat.controllers.js";


const router = express.Router();

router.get("/:projectId/history", getChatHistory);
router.delete("/:messageId/user/:userId", deleteMessage);
router.patch("/:messageId/user/:userId", editMessage);

export default router;