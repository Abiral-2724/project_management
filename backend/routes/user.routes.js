import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getUserDetails } from "../controllers/user.controllers.js";

const router = express.Router() ; 

router.get('/getuser/:id' ,authMiddleware,getUserDetails) ;

export default router ;