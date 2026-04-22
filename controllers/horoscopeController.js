import Horoscope from "../models/horoscope.js";

// Add new Horoscope prediction
export const addHoroscope = async (req, res) => {
  try {
    const item = await Horoscope.create(req.body);
    res.status(201).json({ message: "Horoscope added", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get ALL horoscopes (Fixed)
export const getAllHoroscopes = async (req, res) => {
  try {
    const data = await Horoscope.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get horoscope for a zodiac sign
export const getHoroscopeBySign = async (req, res) => {
  try {
    const { sign } = req.params;
    const data = await Horoscope.find({ zodiacSign: sign });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get prediction for sign + timeframe
export const getHoroscopeBySignAndTime = async (req, res) => {
  try {
    const { sign, time } = req.params;
    const data = await Horoscope.findOne({
      zodiacSign: sign,
      timeFrame: time,
    });
    if (!data) return res.status(404).json({ message: "Horoscope not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update horoscope
export const updateHoroscope = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Horoscope.findByIdAndUpdate(id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Horoscope not found" });
    res.json({ message: "Horoscope updated", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete horoscope
export const deleteHoroscope = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Horoscope.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: "Horoscope not found" });
    res.json({ message: "Horoscope deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
