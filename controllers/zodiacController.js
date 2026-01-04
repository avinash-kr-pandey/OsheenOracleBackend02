import Zodiac from "../models/zodiacModel.js";
import Joi from "joi";

// ---------- CREATE ----------
export const createZodiac = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      nameHindi: Joi.string().required(),
      symbol: Joi.string().required(),
      icon: Joi.string().required(),
      dates: Joi.string().required(),
      datesHindi: Joi.string().required(),
      element: Joi.string().required(),
      elementHindi: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const zodiac = await Zodiac.create(req.body);
    res.json({ message: "Zodiac sign created", zodiac });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- GET ALL ----------
export const getZodiacs = async (req, res) => {
  try {
    const zodiacs = await Zodiac.find().sort({ createdAt: 1 });
    res.json(zodiacs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- GET BY ID ----------
export const getZodiacById = async (req, res) => {
  try {
    const zodiac = await Zodiac.findById(req.params.id);
    if (!zodiac) return res.status(404).json({ message: "Not found" });

    res.json(zodiac);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- UPDATE ----------
export const updateZodiac = async (req, res) => {
  try {
    const zodiac = await Zodiac.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!zodiac) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Updated", zodiac });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- DELETE ----------
export const deleteZodiac = async (req, res) => {
  try {
    const zodiac = await Zodiac.findByIdAndDelete(req.params.id);

    if (!zodiac) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
