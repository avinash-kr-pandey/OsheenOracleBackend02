import express from "express";
import {
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialControllers.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Testimonials
 *   description: Testimonial API Endpoints
 */

/**
 * @swagger
 * /api/testimonials:
 *   get:
 *     summary: Get all testimonials
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: List of testimonials
 *   post:
 *     summary: Create a testimonial (Admin only)
 *     tags: [Testimonials]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, name, comment]
 *             properties:
 *               id:
 *                 type: number
 *               name:
 *                 type: string
 *               zodiac:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Testimonial created
 */
router.route("/").get(getTestimonials).post(protect, isAdmin, createTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   get:
 *     summary: Get a testimonial by id
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial object
 *   put:
 *     summary: Update a testimonial (Admin only)
 *     tags: [Testimonials]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               zodiac:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       200:
 *         description: Testimonial updated
 *   delete:
 *     summary: Delete a testimonial (Admin only)
 *     tags: [Testimonials]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial deleted
 */
router.route("/:id").get(getTestimonial).put(protect, isAdmin, updateTestimonial).delete(protect, isAdmin, deleteTestimonial);

export default router;
