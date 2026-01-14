import express from "express";
import {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "../controllers/faqControllers.js";

const router = express.Router();

router.route("/").get(getFAQs).post(createFAQ);
router.route("/:id").get(getFAQ).put(updateFAQ).delete(deleteFAQ);

export default router;
