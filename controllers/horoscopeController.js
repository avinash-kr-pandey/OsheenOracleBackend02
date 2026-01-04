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

    if (!data)
      return res.status(404).json({ message: "Horoscope not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
