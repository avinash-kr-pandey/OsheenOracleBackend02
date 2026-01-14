import express from "express";
import {
  createReadingService,
  getReadingServices,
  getReadingService,
  updateReadingService,
  deleteReadingService,
} from "../controllers/readingServiceController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { createService, deleteService, getService, getServices, updateService } from "../controllers/readingServiceControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ReadingServices
 *   description: Reading service listings (Tarot, Love, Career, etc.)
 */

/**
 * @swagger
 * /api/reading-services:
 *   post:
 *     summary: Create a reading service (Requires JWT)
 *     tags: [ReadingServices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReadingService'
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/", protect, createReadingService);

/**
 * @swagger
 * /api/reading-services:
 *   get:
 *     summary: Get all reading services
 *     tags: [ReadingServices]
 *     responses:
 *       200:
 *         description: List
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReadingService'
 */
router.get("/", getReadingServices);

/**
 * @swagger
 * /api/reading-services/{id}:
 *   get:
 *     summary: Get a reading service by ID
 *     tags: [ReadingServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadingService'
 *       404:
 *         description: Not found
 */
router.get("/:id", getReadingService);

/**
 * @swagger
 * /api/reading-services/{id}:
 *   put:
 *     summary: Update a reading service (Requires JWT)
 *     tags: [ReadingServices]
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
 *             $ref: '#/components/schemas/ReadingService'
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/:id", protect, updateReadingService);

/**
 * @swagger
 * /api/reading-services/{id}:
 *   delete:
 *     summary: Delete a reading service (Requires JWT)
 *     tags: [ReadingServices]
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
 *         description: Deleted
 */
router.delete("/:id", protect, deleteReadingService);



/**
 * @swagger
 * tags:
 *   name: ReadingServices
 *   description: Reading services API endpoints
 */

/**
 * @swagger
 * /api/reading-services:
 *   get:
 *     summary: Get all reading services
 *     tags: [ReadingServices]
 *     responses:
 *       200:
 *         description: List of services
 */
router.get("/", getServices);

/**
 * @swagger
 * /api/reading-services/{id}:
 *   get:
 *     summary: Get reading service by id
 *     tags: [ReadingServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service object
 *       404:
 *         description: Not found
 */
router.get("/:id", getService);

/**
 * @swagger
 * /api/reading-services:
 *   post:
 *     summary: Create a new reading service
 *     tags: [ReadingServices]
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
router.post("/", createService);

router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
