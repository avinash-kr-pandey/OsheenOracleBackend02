import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus,
  submitServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateRequestStatus,
  deleteServiceRequest,
  getDashboardStats,
} from "../controllers/serviceController.js";
// ✅ Import from 'middleware' (singular), not 'middlewares' (plural)
import { protect, admin, optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ============= PUBLIC ROUTES (Website) - SPECIFIC ROUTES FIRST =============
router.get("/", getAllServices);
router.post("/requests", optionalAuth, submitServiceRequest);

// ============= SERVICE REQUEST ROUTES (Specific paths first) =============
router.get("/requests", protect, getServiceRequests);
router.get("/requests/:id", protect, getServiceRequestById);
router.patch("/requests/:id/status", protect, admin, updateRequestStatus);
router.delete("/requests/:id", protect, admin, deleteServiceRequest);
router.get("/admin/stats", protect, admin, getDashboardStats);

// ============= ADMIN SERVICE ROUTES =============
router.post("/", protect, admin, createService);
router.put("/:id", protect, admin, updateService);
router.delete("/:id", protect, admin, deleteService);
router.patch("/:id/toggle", protect, admin, toggleServiceStatus);

// ============= GENERIC PARAMETER ROUTE (ALWAYS LAST) =============
router.get("/:id", getServiceById);

export default router;
