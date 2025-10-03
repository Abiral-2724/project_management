import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getAllProjectUserIsPartof, getUserDetails } from "../controllers/user.controllers.js";

const router = express.Router() ; 

router.get('/getuser/:id',getUserDetails) ;

router.get('/:userId/project' ,getAllProjectUserIsPartof)  ;

export default router ;