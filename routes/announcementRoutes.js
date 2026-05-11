import express from "express";
import {
  getLatestAnnouncement,
  createOrUpdateAnnouncement,
  getAllAnnouncements,
} from "../controllers/announcementController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/latest", getLatestAnnouncement);

// Protected routes - Admin only
router.get("/", protect, admin, getAllAnnouncements);
router.post("/", protect, admin, createOrUpdateAnnouncement);
router.put("/", protect, admin, createOrUpdateAnnouncement);

export default router;
