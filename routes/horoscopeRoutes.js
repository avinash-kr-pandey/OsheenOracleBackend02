import express from "express";
import {
  addHoroscope,
  getAllHoroscopes, // ✅ Added
  getHoroscopeBySign,
  getHoroscopeBySignAndTime,
  updateHoroscope,
  deleteHoroscope,
} from "../controllers/horoscopeController.js";

const router = express.Router();

// ✅ GET all horoscopes (MUST be before dynamic routes)
router.get("/", getAllHoroscopes);

// POST route
router.post("/", addHoroscope);

// Dynamic routes (specific sign)
router.get("/:sign", getHoroscopeBySign);
router.get("/:sign/:time", getHoroscopeBySignAndTime);

// PUT and DELETE routes
router.put("/:id", updateHoroscope);
router.delete("/:id", deleteHoroscope);

export default router;
