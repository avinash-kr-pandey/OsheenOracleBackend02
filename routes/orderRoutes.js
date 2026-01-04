import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management APIs
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order (Requires JWT)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.post("/", protect, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all user orders (Requires JWT)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get("/", protect, getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order (Requires JWT)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get("/:id", protect, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (Requires JWT)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put("/:id/status", protect, updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order (Requires JWT)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 */
router.delete("/:id", protect, deleteOrder);

export default router;
