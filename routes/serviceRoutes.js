import express from "express";
import {
  // Category management
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  // Subcategory management
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  toggleSubcategoryStatus,
  // Service requests
  submitServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateRequestStatus,
  deleteServiceRequest,
  // Dashboard
  getDashboardStats,
} from "../controllers/serviceController.js";
import { protect, admin, optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ============= PUBLIC ROUTES =============
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.post("/requests", optionalAuth, submitServiceRequest);

// ============= ADMIN CATEGORY ROUTES =============
router.post("/categories", protect, admin, createCategory);
router.put("/categories/:id", protect, admin, updateCategory);
router.delete("/categories/:id", protect, admin, deleteCategory);
router.patch("/categories/:id/toggle", protect, admin, toggleCategoryStatus);

// ============= ADMIN SUBCATEGORY ROUTES =============
router.post(
  "/categories/:categoryId/subcategories",
  protect,
  admin,
  addSubcategory,
);
router.put(
  "/categories/:categoryId/subcategories/:subcategoryId",
  protect,
  admin,
  updateSubcategory,
);
router.delete(
  "/categories/:categoryId/subcategories/:subcategoryId",
  protect,
  admin,
  deleteSubcategory,
);
router.patch(
  "/categories/:categoryId/subcategories/:subcategoryId/toggle",
  protect,
  admin,
  toggleSubcategoryStatus,
);

// ============= SERVICE REQUEST ROUTES =============
router.get("/requests", protect, getServiceRequests);
router.get("/requests/:id", protect, getServiceRequestById);
router.patch("/requests/:id/status", protect, admin, updateRequestStatus);
router.delete("/requests/:id", protect, admin, deleteServiceRequest);

// ============= ADMIN DASHBOARD =============
router.get("/admin/stats", protect, admin, getDashboardStats);

export default router;
