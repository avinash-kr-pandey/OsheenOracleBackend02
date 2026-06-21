import express from "express";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/userControllers.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(admin);

router.route("/")
  .get(getAllUsers);

router.route("/:id")
  .delete(deleteUser);

router.route("/:id/role")
  .put(updateUserRole);

export default router;
