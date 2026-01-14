import express from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress
} from "../controllers/addressControllers.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Address management APIs
 */

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Add a new address (Requires JWT)
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ["type", "name", "address", "phone"]
 *             properties:
 *               type:
 *                 type: string
 *                 description: Address type
 *                 example: "Home"
 *                 enum: ["Home", "Work", "Other"]
 *               name:
 *                 type: string
 *                 description: Recipient name
 *                 example: "John Doe"
 *               address:
 *                 type: string
 *                 description: Full address
 *                 example: "123 Main St, New York, NY 10001"
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *                 example: "+1234567890"
 *               isDefault:
 *                 type: boolean
 *                 description: Set as default address
 *                 default: false
 *                 example: false
 *     responses:
 *       201:
 *         description: Address added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Address added successfully"
 *                 addresses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "\"phone\" is required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/", protect, addAddress);

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get all addresses (Requires JWT)
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 */
router.get("/", protect, getAddresses);

/**
 * @swagger
 * /api/addresses/{addressId}:
 *   put:
 *     summary: Update an address (Requires JWT)
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 addresses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 */
router.put("/:addressId", protect, updateAddress);

/**
 * @swagger
 * /api/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address (Requires JWT)
 *     tags: [Addresses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 addresses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 */
router.delete("/:addressId", protect, deleteAddress);

export default router;
