import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadFile } from "../controllers/uploadController.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Dynamic path detection for Hostinger
const getUploadPath = () => {
  // For Hostinger production
  if (process.env.NODE_ENV === "production") {
    // Hostinger public_html or root path
    const possiblePaths = [
      "/home/u123456789/public_html/uploads", // Hostinger public_html
      "/home/u123456789/domains/yourdomain.com/public_html/uploads",
      path.join(process.cwd(), "public", "uploads"), // Local fallback
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

  // Development fallback
  return path.join(process.cwd(), "public", "uploads");
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

// Upload endpoint
router.post("/file-upload", upload.single("file"), uploadFile);

// Multiple file upload
router.post("/multiple-upload", upload.array("files", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      type: file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
          ? "video"
          : "document",
      url: `/uploads/${
        file.mimetype.startsWith("image/")
          ? "images/"
          : file.mimetype.startsWith("video/")
            ? "videos/"
            : "documents/"
      }${file.filename}`,
    }));

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
});

// Serve static files from uploads directory
router.use("/uploads", express.static(baseUploadPath));

export default router;
