// routes/user.auth.routes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
  resendOtp,
  accountSetup,
} from "../controllers/user.auth.controllers.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// POST /api/v1/auth/user/register
router.post("/register", registerUser);

// POST /api/v1/auth/user/login
router.post("/login", loginUser);

// POST /api/v1/auth/user/logout
router.post("/logout", logoutUser);

// POST /api/v1/auth/user/verify/:id
router.post("/verify/:id", verifyUser);

// POST /api/v1/auth/user/resend-otp/:id
router.post("/resend-otp/:id", resendOtp);

// POST /api/v1/auth/user/setup/:id  (multipart - profile photo upload)
router.post("/setup/:id", upload.single("file"), accountSetup);

export default router;