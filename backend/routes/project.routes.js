import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createNewProject, getAllProjectsOfUser, getProjectById } from "../controllers/project.controllers.js";

const router = express.Router() ;

router.post('/:userid/project/new/create' ,authMiddleware ,createNewProject) ;
router.get('/:userid/allProject' ,authMiddleware ,getAllProjectsOfUser) ; 
router.get('/:userId/project/:projectId/get' ,authMiddleware ,getProjectById) ; 
export default router ; 