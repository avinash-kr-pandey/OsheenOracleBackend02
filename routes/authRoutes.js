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
} from "../controllers/authControllers.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for profile image upload
const getUploadPath = () => {
  if (process.env.NODE_ENV === "production") {
    const possiblePaths = [
      "/home/u123456789/public_html/uploads",
      "/home/u123456789/domains/yourdomain.com/public_html/uploads",
      path.join(process.cwd(), "public", "uploads"),
      path.join(process.cwd(), "uploads"),
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

  return path.join(process.cwd(), "public", "uploads");
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for profile images
});

// ==================== AUTH ROUTES ====================

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

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
