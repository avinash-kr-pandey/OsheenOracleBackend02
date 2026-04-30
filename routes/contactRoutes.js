import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  updateStatus,
  assignAstrologer,
  getPendingConsultations,
  getTodaysConsultations,
  getDashboardStats,
  getAstrologerConsultations,
  getUserConsultations,
  cancelConsultation,
} from "../controllers/contactController.js";
import { protect, admin, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/", createContact);

// Protected routes - User specific
router.get("/my-consultations", protect, getUserConsultations);
router.post("/:id/cancel", protect, cancelConsultation);

// Protected routes - Astrologer specific
router.get(
  "/astrologer/my-consultations",
  protect,
  authorize("astrologer"),
  getAstrologerConsultations,
);

// Protected routes - Admin only
router.get("/", protect, admin, getAllContacts);
router.get("/pending/list", protect, admin, getPendingConsultations);
router.get("/today/list", protect, admin, getTodaysConsultations);
router.get("/stats/dashboard", protect, admin, getDashboardStats);
router.get("/:id", protect, admin, getContactById);
router.put("/:id", protect, admin, updateContact);
router.delete("/:id", protect, admin, deleteContact);
router.patch("/:id/status", protect, admin, updateStatus);
router.post("/:id/assign-astrologer", protect, admin, assignAstrologer);

export default router;
