import express from "express";
import {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
} from "../controllers/readingPackageControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ReadingPackages
 *   description: Reading package API endpoints
 */

/**
 * @swagger
 * /api/reading-packages:
 *   get:
 *     summary: Get all reading packages
 *     tags: [ReadingPackages]
 *     responses:
 *       200:
 *         description: List of packages
 */
router.get("/", getPackages);

/**
 * @swagger
 * /api/reading-packages/{id}:
 *   get:
 *     summary: Get package by id
 *     tags: [ReadingPackages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Package object
 *       404:
 *         description: Not found
 */
router.get("/:id", getPackage);

/**
 * @swagger
 * /api/reading-packages:
 *   post:
 *     summary: Create a new reading package
 *     tags: [ReadingPackages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/", createPackage);

router.put("/:id", updatePackage);
router.delete("/:id", deletePackage);

export default router;
