import express from "express";
import {
  getAstrologers,
  getAstrologerById,
  createAstrologer,
  updateAstrologer,
  deleteAstrologer,
} from "../controllers/astrologerControllers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Astrologers
 *   description: Astrologer API Endpoints
 */

/**
 * @swagger
 * /api/astrologers:
 *   get:
 *     summary: Get all astrologers
 *     tags: [Astrologers]
 *     responses:
 *       200:
 *         description: List of astrologers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Astrologer'
 */
router.get("/", getAstrologers);

/**
 * @swagger
 * /api/astrologers/{id}:
 *   get:
 *     summary: Get astrologer by id
 *     tags: [Astrologers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Astrologer object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Astrologer'
 *       404:
 *         description: Not found
 */
router.get("/:id", getAstrologerById);

/**
 * @swagger
 * /api/astrologers:
 *   post:
 *     summary: Create a new astrologer
 *     tags: [Astrologers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Astrologer'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Astrologer'
 */
router.post("/", createAstrologer);

router.put("/:id", updateAstrologer);
router.delete("/:id", deleteAstrologer);

export default router;
