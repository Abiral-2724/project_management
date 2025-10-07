import express from "express"; 
import { addSubTasks, addTasks, editsubTasks, editTasks, getalltaskswiththeirsubtasks, getmycreatedTask, getTaskAssignedoftheUser, markSubTaskComplete, markTaskComplete, projectDashboard } from "../controllers/tasks.controllers.js";

const router = express.Router()  ; 

router.post('/:userId/project/:projectId/add/tasks' ,addTasks) ;
router.post('/:userId/project/:projectId/task/add/subTasks' ,addSubTasks) ;

router.patch('/:userId/project/:projectId/task/updatedtask/status' ,markTaskComplete)
router.patch('/:userId/project/:projectId/task/updatedsubtask/status' ,markSubTaskComplete) ;

router.get('/:userId/tasks/my/created/task' ,getmycreatedTask) ;

router.get('/:userId/project/:projectId/task/get/complete/detail' ,getalltaskswiththeirsubtasks) ; 

router.patch('/:userId/project/:projectId/update/tasks' ,editTasks) ;
router.patch('/:userId/project/:projectId/update/subtasks' ,editsubTasks) ;


router.get('/:userId/project/get/myTasks' ,getTaskAssignedoftheUser) ; 

router.get('/:userId/project/:projectId/dashboard/detail' ,projectDashboard) ;


export default router ;