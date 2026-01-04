import express from "express";
import {
  createZodiac,
  getZodiacs,
  getZodiacById,
  updateZodiac,
  deleteZodiac,
} from "../controllers/zodiacController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Zodiacs
 *   description: Zodiac sign management APIs
 */

/**
 * @swagger
 * /api/zodiacs:
 *   get:
 *     summary: Get all zodiac signs
 *     tags: [Zodiacs]
 *     responses:
 *       200:
 *         description: List of all zodiac signs
 */
router.get("/", getZodiacs);

/**
 * @swagger
 * /api/zodiacs/{id}:
 *   get:
 *     summary: Get a zodiac sign by ID
 *     tags: [Zodiacs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Zodiac ID
 *     responses:
 *       200:
 *         description: Zodiac sign details
 *       404:
 *         description: Zodiac not found
 */
router.get("/:id", getZodiacById);

/**
 * @swagger
 * /api/zodiacs:
 *   post:
 *     summary: Create a new zodiac sign
 *     tags: [Zodiacs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               element:
 *                 type: string
 *     responses:
 *       201:
 *         description: Zodiac created successfully
 */
router.post("/", createZodiac);

/**
 * @swagger
 * /api/zodiacs/{id}:
 *   put:
 *     summary: Update a zodiac sign
 *     tags: [Zodiacs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Zodiac ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               element:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zodiac updated successfully
 */
router.put("/:id", updateZodiac);

/**
 * @swagger
 * /api/zodiacs/{id}:
 *   delete:
 *     summary: Delete a zodiac sign
 *     tags: [Zodiacs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Zodiac ID
 *     responses:
 *       200:
 *         description: Zodiac deleted successfully
 */
router.delete("/:id", deleteZodiac);

export default router;
