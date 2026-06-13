import express from "express";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/productCategoryControllers.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// Public: Get all categories
router.get("/", getCategories);

// Admin-only: Create a new category
router.post("/", protect, isAdmin, createCategory);

// Admin-only: Delete a category
router.delete("/:id", protect, isAdmin, deleteCategory);

export default router;
