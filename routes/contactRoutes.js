import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  updateStatus,
  getDashboardStats,
  getUserConsultations,
} from "../controllers/contactController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/", createContact);

// Protected routes - User specific
router.get("/my-contacts", protect, getUserConsultations);

// Protected routes - Admin only
router.get("/", protect, admin, getAllContacts);
router.get("/stats/dashboard", protect, admin, getDashboardStats);
router.get("/:id", protect, admin, getContactById);
router.put("/:id", protect, admin, updateContact);
router.delete("/:id", protect, admin, deleteContact);
router.patch("/:id/status", protect, admin, updateStatus);

export default router;
