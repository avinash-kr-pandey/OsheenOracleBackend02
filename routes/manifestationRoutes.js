import express from "express";
import {
  createManifestationStep,
  getManifestationSteps,
  getManifestationStep,
  updateManifestationStep,
  deleteManifestationStep,
} from "../controllers/manifestationController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ManifestationSteps
 *   description: Manifestation step management APIs
 */

/**
 * @swagger
 * /api/manifestation-steps:
 *   post:
 *     summary: Create a new manifestation step
 *     tags: [ManifestationSteps]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ManifestationStep'
 *     responses:
 *       201:
 *         description: Manifestation step created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ManifestationStep'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, isAdmin, createManifestationStep);

/**
 * @swagger
 * /api/manifestation-steps:
 *   get:
 *     summary: Get all manifestation steps
 *     tags: [ManifestationSteps]
 *     responses:
 *       200:
 *         description: List of all manifestation steps
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ManifestationStep'
 */
router.get("/", getManifestationSteps);

/**
 * @swagger
 * /api/manifestation-steps/{id}:
 *   get:
 *     summary: Get a single manifestation step
 *     tags: [ManifestationSteps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manifestation step ID
 *     responses:
 *       200:
 *         description: Manifestation step details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ManifestationStep'
 *       404:
 *         description: Manifestation step not found
 */
router.get("/:id", getManifestationStep);

/**
 * @swagger
 * /api/manifestation-steps/{id}:
 *   put:
 *     summary: Update a manifestation step
 *     tags: [ManifestationSteps]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manifestation step ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ManifestationStep'
 *     responses:
 *       200:
 *         description: Manifestation step updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ManifestationStep'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Manifestation step not found
 */
router.put("/:id", protect, isAdmin, updateManifestationStep);

/**
 * @swagger
 * /api/manifestation-steps/{id}:
 *   delete:
 *     summary: Delete a manifestation step
 *     tags: [ManifestationSteps]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manifestation step ID
 *     responses:
 *       200:
 *         description: Manifestation step deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Manifestation step not found
 */
router.delete("/:id", protect, isAdmin, deleteManifestationStep);

export default router;