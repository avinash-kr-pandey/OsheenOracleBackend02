import express from "express";
import {
  addHoroscope,
  getHoroscopeBySign,
  getHoroscopeBySignAndTime,
} from "../controllers/horoscopeController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Horoscope
 *   description: Horoscope prediction APIs
 */

/**
 * @swagger
 * /api/horoscope:
 *   post:
 *     summary: Add a horoscope prediction
 *     tags: [Horoscope]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sign:
 *                 type: string
 *               date:
 *                 type: string
 *               prediction:
 *                 type: string
 *               timeFrame:
 *                 type: string
 *     responses:
 *       201:
 *         description: Horoscope added successfully
 */
router.post("/", addHoroscope);

/**
 * @swagger
 * /api/horoscope/{sign}:
 *   get:
 *     summary: Get horoscope by zodiac sign
 *     tags: [Horoscope]
 *     parameters:
 *       - in: path
 *         name: sign
 *         required: true
 *         schema:
 *           type: string
 *         description: Zodiac sign (e.g., Aries, Taurus)
 *     responses:
 *       200:
 *         description: Horoscope predictions for the sign
 *       404:
 *         description: No horoscope found for this sign
 */
router.get("/:sign", getHoroscopeBySign);

/**
 * @swagger
 * /api/horoscope/{sign}/{time}:
 *   get:
 *     summary: Get horoscope by zodiac sign and time frame
 *     tags: [Horoscope]
 *     parameters:
 *       - in: path
 *         name: sign
 *         required: true
 *         schema:
 *           type: string
 *         description: Zodiac sign (e.g., Aries, Taurus)
 *       - in: path
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *         description: Time frame (e.g., daily, weekly, monthly, yearly)
 *     responses:
 *       200:
 *         description: Horoscope prediction for the sign and time frame
 *       404:
 *         description: No horoscope found for this sign and time
 */
router.get("/:sign/:time", getHoroscopeBySignAndTime);

export default router;
