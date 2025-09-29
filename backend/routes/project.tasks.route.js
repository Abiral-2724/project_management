import express from "express"; 
import { addSubTasks, addTasks, getTaskoftheUser, markSubTaskComplete, markTaskComplete } from "../controllers/tasks.controllers.js";

const router = express.Router()  ; 

router.post('/:userId/project/:projectId/add/tasks' ,addTasks) ;
router.post('/:userId/project/:projectId/task/:taskId/add/subTasks' ,addSubTasks) ;

router.patch('/:userId/project/:projectId/task/:taskId/updatedtask/status' ,markTaskComplete)
router.patch('/:userId/project/:projectId/task/:taskId/updatedsubtask/status' ,markSubTaskComplete) ;

router.get('/:userId/project/get/myTasks' ,getTaskoftheUser) ; 


export default router ;