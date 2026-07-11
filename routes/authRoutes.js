import express from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  profile,
  googleLogin,
  updateProfile,
  changePassword,
  updateProfileImage,
  verifyOtp,
  resendOtp,
  verifyResetOtp,
  resendResetOtp,
} from "../controllers/authControllers.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for profile image upload
const getUploadPath = () => {
  // If on Windows (local dev), bypass Hostinger production paths to avoid drive root directory mapping issues
  if (process.platform === "win32") {
    const localPath = path.join(__dirname, "..", "public", "uploads");
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath, { recursive: true });
    }
    return localPath;
  }

  if (process.env.NODE_ENV === "production") {
    const homedir = os.homedir();
    const possiblePaths = [
      path.join(homedir, "public_html", "uploads"),
      path.join(homedir, "domains", "yourdomain.com", "public_html", "uploads"),
      path.join(__dirname, "..", "public", "uploads"),
      path.join(__dirname, "..", "uploads"),
    ];

    for (const dirPath of possiblePaths) {
      try {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        return dirPath;
      } catch (err) {
        console.log(`Cannot create ${dirPath}:`, err.message);
      }
    }
  }

  return path.join(__dirname, "..", "public", "uploads");
};

const baseUploadPath = getUploadPath();
const imagesDir = path.join(baseUploadPath, "images");

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Storage configuration for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");
    cb(null, `profile-${Date.now()}-${safeName}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, png, gif, webp)"), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for profile images
});

// ==================== AUTH ROUTES ====================

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/resend-reset-otp", resendResetOtp);

// Protected routes (require authentication)
router.get("/profile", protect, profile);
router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

// Profile image upload - WITHOUT :id parameter
router.post(
  "/update-profile-image", // ✅ Removed /:id
  protect,
  upload.single("file"),
  updateProfileImage,
);

export default router;
