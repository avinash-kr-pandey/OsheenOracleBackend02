import path from "path";
import fs from "fs";

export const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Determine file type
    let fileType = "document";
    let subPath = "";

    if (req.file.mimetype.startsWith("image/")) {
      fileType = "image";
      subPath = "images";
    } else if (req.file.mimetype.startsWith("video/")) {
      fileType = "video";
      subPath = "videos";
    }

    // Get base URL (works on Hostinger)
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Construct URL
    const fileUrl = `${baseUrl}/uploads/${subPath}/${req.file.filename}`;

    return res.json({
      success: true,
      message: "File uploaded successfully",
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        type: fileType,
        url: fileUrl,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err.message,
    });
  }
};
