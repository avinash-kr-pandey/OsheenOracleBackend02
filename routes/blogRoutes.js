import express from "express";
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  getBlogsByCategory,
  incrementComments,
  getBlogComments,
  addBlogComment,
  adminDeleteComment,
  adminGetAllComments,
  adminApproveComment,
} from "../controllers/blogController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// ==================== PUBLIC BLOG ROUTES ====================
router.get("/", getBlogs);
router.get("/category/:category", getBlogsByCategory);
router.get("/:id", getBlog);

// ==================== ADMIN BLOG ROUTES ====================
router.post("/", protect, isAdmin, createBlog);
router.put("/:id", protect, isAdmin, updateBlog);
router.delete("/:id", protect, isAdmin, deleteBlog);

// ==================== COMMENT ROUTES ====================

// Public comment routes
router.get("/:id/comments", getBlogComments);
router.post("/:id/comments", addBlogComment);
router.put("/:id/comments/increment", incrementComments);

// Admin Comment Routes
router.get("/comments", protect, isAdmin, adminGetAllComments);
router.put("/comments/:id/approve", protect, isAdmin, adminApproveComment);
router.delete("/comments/:id", protect, isAdmin, adminDeleteComment);

export default router;
