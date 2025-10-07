import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createNewProject, getAllMemberOfProject, getAllProjectsOfUser, getCompleteDetailOfProject, getProjectById, getProjectTimeline, getViewsOfProject, sendingInviteToAddMemberToProject, updateRole } from "../controllers/project.controllers.js";

const router = express.Router() ;

router.post('/:userid/project/new/create' ,authMiddleware ,createNewProject) ;
router.get('/:userid/allProject' ,authMiddleware ,getAllProjectsOfUser) ; 
router.get('/:userId/project/:projectId/get' ,authMiddleware ,getProjectById) ; 
router.get('/:userId/project/:projectId/get/members',authMiddleware ,getAllMemberOfProject) ; 

router.post('/:userId/project/:projectId/addMember/sendInvite' ,authMiddleware ,sendingInviteToAddMemberToProject) ; 

router.patch('/:userId/project/:projectId/update/role',authMiddleware ,updateRole) ; 
router.get('/:userId/project/:projectId/get/views' ,authMiddleware,getViewsOfProject) ; 

router.get('/:userId/project/:projectId/get/project/Timeline' ,authMiddleware ,getProjectTimeline)

router.get('/:userId/project/:projectId/get/complete/projectDetails' ,authMiddleware ,getCompleteDetailOfProject) ; 

export default router ; 