import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();

// Create directories for different file types
const imagesDir = "/var/www/uploads/images";
const videosDir = "/var/www/uploads/videos";

// Ensure all directories exist
[imagesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Updated storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Choose destination based on file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, imagesDir);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, videosDir);
    } else {
      cb(null, "/var/www/uploads");
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// Updated file filter to include videos
const fileFilter = (req, file, cb) => {
  const allowed = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    // Documents
    "application/pdf",
  ];
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only images, videos, and PDFs are allowed.`));
  }
};

// Increased limit for videos (200MB)
const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 200 * 1024 * 1024 }
});

// POST /api/uploads/file-upload
router.post("/file-upload", upload.single("file"), uploadFile);

// Optional: Add multiple file upload
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
      url: `/uploads/${file.filename}`,
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

export default router;
