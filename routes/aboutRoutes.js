import express from "express";
import { getAbout, updateAbout } from "../controllers/aboutController.js";
import { updateAboutValidation } from "../validators/aboutValidator.js";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

router.get("/", getAbout);
router.put("/", updateAboutValidation, validate, updateAbout);

export default router;
