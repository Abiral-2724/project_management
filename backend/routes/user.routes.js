// routes/user.routes.js
import express from "express";
import { getUserById, getUserProjects } from "../controllers/user.controllers.js";
import  {authMiddleware} from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/v1/user/:id
router.get("/:id", authMiddleware , getUserById);

// GET /api/v1/user/:userId/projects
router.get("/:userId/projects", authMiddleware , getUserProjects);

export default router;