import express from "express";
import { addRishi, getRishis, getRishi } from "../controllers/rishiController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rishis
 *   description: Rishi management APIs
 */

/**
 * @swagger
 * /api/rishis:
 *   post:
 *     summary: Add a new rishi
 *     tags: [Rishis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               biography:
 *                 type: string
 *               era:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rishi added successfully
 */
router.post("/", addRishi);

/**
 * @swagger
 * /api/rishis:
 *   get:
 *     summary: Get all rishis
 *     tags: [Rishis]
 *     responses:
 *       200:
 *         description: List of all rishis
 */
router.get("/", getRishis);

/**
 * @swagger
 * /api/rishis/{id}:
 *   get:
 *     summary: Get a specific rishi
 *     tags: [Rishis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rishi ID
 *     responses:
 *       200:
 *         description: Rishi details
 *       404:
 *         description: Rishi not found
 */
router.get("/:id", getRishi);

export default router;
