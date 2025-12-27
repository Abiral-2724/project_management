import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createNewProject, getAllMemberOfProject, getAllProjectsOfUser, getCompleteDetailOfProject, getProjectById, getProjectTimeline, getViewsOfProject, sendingInviteToAddMemberToProject, updateRole } from "../controllers/project.controllers.js";

const router = express.Router() ;

router.post('/:userid/project/new/create'  ,createNewProject) ;
router.get('/:userid/allProject' ,getAllProjectsOfUser) ; 
router.get('/:userId/project/:projectId/get'  ,getProjectById) ; 
router.get('/:userId/project/:projectId/get/members' ,getAllMemberOfProject) ; 

router.post('/:userId/project/:projectId/addMember/sendInvite'  ,sendingInviteToAddMemberToProject) ; 

router.patch('/:userId/project/:projectId/update/role' ,updateRole) ; 
router.get('/:userId/project/:projectId/get/views' ,getViewsOfProject) ; 

router.get('/:userId/project/:projectId/get/project/Timeline'  ,getProjectTimeline)

router.get('/:userId/project/:projectId/get/complete/projectDetails'  ,getCompleteDetailOfProject) ; 

export default router ; 