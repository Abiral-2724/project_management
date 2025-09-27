import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createNewProject } from "../controllers/project.controllers.js";

const router = express.Router() ;

router.post('/:userid/project/new/create' ,authMiddleware ,createNewProject) ;

export default router ; 