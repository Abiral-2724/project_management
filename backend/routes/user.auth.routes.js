import express from "express";
import { accountSetup, getUserDetails, login, logout, register, resendOTPEmail, verifyEmail } from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router() ; 

router.post('/register' ,register) ; 
router.post('/login' ,login) ;
router.get('/logout' ,logout)
router.post('/verifyemail/:id' ,verifyEmail) ; 
router.patch('/resendemail/:id' ,resendOTPEmail) ; 
router.patch('/account_setup/:id' ,upload.single('image'),accountSetup) ; 
 
export default router ;