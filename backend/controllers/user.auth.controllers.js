import client from "../prisma.js";
import dotenv from "dotenv";


import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import cloudinary from "../utils/cloudinary.js";
dotenv.config({});

// ─── EMAIL TRANSPORTER ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp, fullname = "") => {
  await transporter.sendMail({
    from: `"Planzo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Planzo account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#09090b;border-radius:16px;border:1px solid #27272a">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px">
          <div style="width:32px;height:32px;background:#6366f1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">⚡</div>
          <span style="color:#fff;font-weight:700;font-size:18px">Nexus</span>
        </div>
        <h2 style="color:#fafafa;margin:0 0 8px">Verify your email</h2>
        <p style="color:#a1a1aa;margin:0 0 24px">Use the code below to verify your account${fullname ? `, ${fullname}` : ""}.</p>
        <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#6366f1">${otp}</span>
        </div>
        <p style="color:#71717a;font-size:13px;margin:0">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const existing = await client.user.findFirst({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    const user = await client.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        OTP: otp,
        isVerified: false,
      },
    });

    // Send verification email
    try {
      await sendOtpEmail(user.email, otp);
    } catch (mailErr) {
      console.warn("Email send failed:", mailErr.message);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.SECERET_KEY, { expiresIn: "7d" });

    return res.status(201).json({
      success: true,
      message: "Account created! Please verify your email.",
      token,
      id: user.id,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        profile: user.profile,
        isVerified: user.isVerified,
        myRole: user.myRole,
      },
    });
  } catch (e) {
    console.error("Register error:", e);
    return res.status(500).json({ success: false, message: "Error creating account" });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await client.user.findFirst({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.SECERET_KEY, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      id: user.id,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        profile: user.profile,
        isVerified: user.isVerified,
        myRole: user.myRole,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ success: false, message: "Error during login" });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logoutUser = async (req, res) => {
  // JWT is stateless — client removes the token.
  // If you use a blocklist, add it here.
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ─── VERIFY EMAIL (OTP) ───────────────────────────────────────────────────────
export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    const user = await client.user.findFirst({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: "Email already verified" });
    }

    if (user.OTP !== Number(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    await client.user.update({
      where: { id },
      data: { isVerified: true, OTP: 0 },
    });

    return res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (e) {
    console.error("Verify error:", e);
    return res.status(500).json({ success: false, message: "Error verifying email" });
  }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
export const resendOtp = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await client.user.findFirst({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    await client.user.update({ where: { id }, data: { OTP: otp } });

    try {
      await sendOtpEmail(user.email, otp, user.fullname);
    } catch (mailErr) {
      console.warn("Email send failed:", mailErr.message);
    }

    return res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (e) {
    console.error("Resend OTP error:", e);
    return res.status(500).json({ success: false, message: "Error resending OTP" });
  }
};

// ─── ACCOUNT SETUP ───────────────────────────────────────────────────────────
// Called after verify — user uploads profile photo, sets name + role
export const accountSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, myrole } = req.body;

    if (!fullname || fullname.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Full name is required" });
    }

    const user = await client.user.findFirst({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let profileUrl = user.profile;

    // Upload profile photo to Cloudinary if provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
          { folder: "nexus_profiles", resource_type: "image", transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }] }
        );
        profileUrl = result.secure_url;
      } catch (cloudErr) {
        console.warn("Cloudinary profile upload warning:", cloudErr.message);
      }
    }

    const updated = await client.user.update({
      where: { id },
      data: {
        fullname: fullname.trim(),
        myRole: myrole || "Team_member",
        profile: profileUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile setup complete",
      user: {
        id: updated.id,
        email: updated.email,
        fullname: updated.fullname,
        profile: updated.profile,
        isVerified: updated.isVerified,
        myRole: updated.myRole,
      },
    });
  } catch (e) {
    console.error("Account setup error:", e);
    return res.status(500).json({ success: false, message: "Error setting up account" });
  }
};