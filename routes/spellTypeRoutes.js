import express from "express";
import {
  createSpellType,
  getSpellTypes,
  getSpellType,
  updateSpellType,
  deleteSpellType,
} from "../controllers/spellTypeController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SpellTypes
 *   description: Spell type management APIs
 */

/**
 * @swagger
 * /api/spell-types:
 *   post:
 *     summary: Create a new spell type
 *     tags: [SpellTypes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SpellType'
 *     responses:
 *       201:
 *         description: Spell type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpellType'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, isAdmin, createSpellType);

/**
 * @swagger
 * /api/spell-types:
 *   get:
 *     summary: Get all spell types
 *     tags: [SpellTypes]
 *     responses:
 *       200:
 *         description: List of all spell types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SpellType'
 */
router.get("/", getSpellTypes);

/**
 * @swagger
 * /api/spell-types/{id}:
 *   get:
 *     summary: Get a single spell type
 *     tags: [SpellTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Spell type ID
 *     responses:
 *       200:
 *         description: Spell type details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpellType'
 *       404:
 *         description: Spell type not found
 */
router.get("/:id", getSpellType);

/**
 * @swagger
 * /api/spell-types/{id}:
 *   put:
 *     summary: Update a spell type
 *     tags: [SpellTypes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Spell type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SpellType'
 *     responses:
 *       200:
 *         description: Spell type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SpellType'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Spell type not found
 */
router.put("/:id", protect, isAdmin, updateSpellType);

/**
 * @swagger
 * /api/spell-types/{id}:
 *   delete:
 *     summary: Delete a spell type
 *     tags: [SpellTypes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Spell type ID
 *     responses:
 *       200:
 *         description: Spell type deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Spell type not found
 */
router.delete("/:id", protect, isAdmin, deleteSpellType);

export default router;