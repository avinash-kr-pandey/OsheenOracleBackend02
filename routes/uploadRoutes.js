import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { uploadFile } from "../controllers/uploadController.js";
import { fileURLToPath } from "url";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Dynamic path detection for Hostinger
const getUploadPath = () => {
  // If on Windows (local dev), bypass Hostinger production paths to avoid drive root directory mapping issues
  if (process.platform === "win32") {
    const localPath = path.join(__dirname, "..", "public", "uploads");
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath, { recursive: true });
    }
    return localPath;
  }

  // For Hostinger production
  if (process.env.NODE_ENV === "production") {
    const homedir = os.homedir();
    // Hostinger public_html or root path
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

  // Development fallback
  return path.join(__dirname, "..", "public", "uploads");
};

const baseUploadPath = getUploadPath();
const imagesDir = path.join(baseUploadPath, "images");
const videosDir = path.join(baseUploadPath, "videos");
const documentsDir = path.join(baseUploadPath, "documents");

// Ensure all directories exist
[imagesDir, videosDir, documentsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, imagesDir);
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, videosDir);
    } else {
      cb(null, documentsDir);
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only images, videos, and PDFs are allowed.`,
      ),
      false,
    );
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for Hostinger
});

// Upload endpoint (Admin only)
router.post(
  "/file-upload",
  protect,
  isAdmin,
  upload.single("file"),
  uploadFile,
);

// Multiple file upload (Admin only)
router.post(
  "/multiple-upload",
  protect,
  isAdmin,
  upload.array("files", 5),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      let protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host || "";
      if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
        protocol = "https";
      }
      const baseUrl = `${protocol}://${host}`;

      const files = req.files.map((file) => {
        let subPath = "documents";
        if (file.mimetype.startsWith("image/")) subPath = "images";
        else if (file.mimetype.startsWith("video/")) subPath = "videos";

        return {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          type: file.mimetype.startsWith("image/")
            ? "image"
            : file.mimetype.startsWith("video/")
              ? "video"
              : "document",
          url: `${baseUrl}/uploads/${subPath}/${file.filename}`,
        };
      });

      res.status(200).json({
        success: true,
        message: `${files.length} files uploaded successfully`,
        files: files,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

// Serve static files from uploads directory
router.use("/uploads", express.static(baseUploadPath));

export default router;
