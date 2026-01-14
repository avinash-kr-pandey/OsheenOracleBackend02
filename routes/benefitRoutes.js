import express from "express";
import {
  getBenefits,
  getBenefit,
  createBenefit,
  updateBenefit,
  deleteBenefit,
} from "../controllers/benefitControllers.js";

const router = express.Router();

router.route("/").get(getBenefits).post(createBenefit);
router.route("/:id").get(getBenefit).put(updateBenefit).delete(deleteBenefit);

export default router;
