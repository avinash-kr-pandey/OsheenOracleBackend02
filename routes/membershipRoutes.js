import express from "express";
import {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/membershipControllers.js";

const router = express.Router();

/**
 * GET /api/memberships
 * POST /api/memberships
 */
router.route("/").get(getPlans).post(createPlan);

/**
 * GET/PUT/DELETE /api/memberships/:id
 */
router.route("/:id").get(getPlan).put(updatePlan).delete(deletePlan);

export default router;
