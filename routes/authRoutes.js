// import express from "express";
// import {
//   register,
//   login,
//   logout,
//   forgotPassword,
//   resetPassword,
//   profile
// } from "../controllers/authController.js";
// import { protect } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.post("/logout", logout);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password/:token", resetPassword);

// router.get("/profile", protect, profile);

// export default router;
import express from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  profile,
  googleLogin,
} from "../controllers/authControllers.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Auth API Endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: ["user", "admin"]
 *                 description: Optional. Setting "admin" via public register is not allowed.
 *     responses:
 *       200:
 *         description: Registration successful
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and get token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", login);


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Auth API Endpoints
 */

// ... existing routes ...

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Login or register with Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token received from frontend
 *     responses:
 *       200:
 *         description: Google login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.post("/google", googleLogin);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset link
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post("/reset-password/:token", resetPassword);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile (Requires JWT)
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/profile", protect, profile);

export default router;
