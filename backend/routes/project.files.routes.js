import express from "express"; 
import upload from "../middlewares/multer.js";
import { getAllFilesOfProject, uploadfile } from "../controllers/files.controllers.js";

const router = express.Router() ; 

router.post('/:userId/project/:projectId/task/:taskId/file/upload' ,upload.single('image'),uploadfile); 

router.get('/:userId/project/:projectId/task/:taskId/file/getAll' ,getAllFilesOfProject) ; 

export default router ;

