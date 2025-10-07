import express from "express"; 
import { addSubTasks, addTasks, getmycreatedTask, getTaskAssignedoftheUser, markSubTaskComplete, markTaskComplete } from "../controllers/tasks.controllers.js";

const router = express.Router()  ; 

router.post('/:userId/project/:projectId/add/tasks' ,addTasks) ;
router.post('/:userId/project/:projectId/task/add/subTasks' ,addSubTasks) ;

router.patch('/:userId/project/:projectId/task/:taskId/updatedtask/status' ,markTaskComplete)
router.patch('/:userId/project/:projectId/task/:taskId/updatedsubtask/status' ,markSubTaskComplete) ;

router.get('/:userId/tasks/my/created/task' ,getmycreatedTask)

router.get('/:userId/project/get/myTasks' ,getTaskAssignedoftheUser) ; 


export default router ;