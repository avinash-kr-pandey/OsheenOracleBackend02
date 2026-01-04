import Joi from "joi";
import Astrologer from "../models/astrologer.js";
import astrologersData from "../utils/astrologersData.js";

const astrologerSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
  experience: Joi.string().allow('', null),
  specialization: Joi.string().allow('', null),
  rating: Joi.number().precision(1).min(0).max(5).allow(null),
  reviews: Joi.number().integer().allow(null),
  expertise: Joi.array().items(Joi.string()),
  languages: Joi.array().items(Joi.string()),
  image: Joi.string().allow('', null),
  whatsappNumber: Joi.string().allow('', null),
  about: Joi.string().allow('', null),
  successRate: Joi.string().allow('', null),
  clientsHelped: Joi.string().allow('', null),
  consultationFee: Joi.string().allow('', null),
  responseTime: Joi.string().allow('', null),
  availability: Joi.string().allow('', null),
  skills: Joi.array().items(Joi.string()),
});

export const getAstrologers = async (req, res) => {
  try {
    let list = await Astrologer.find().lean();
    if (!list || list.length === 0) {
      // seed
      await Astrologer.insertMany(astrologersData);
      list = await Astrologer.find().lean();
    }
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAstrologerById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await Astrologer.findOne({ id }).lean();
    if (!item) return res.status(404).json({ message: "Astrologer not found" });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createAstrologer = async (req, res) => {
  try {
    const { value, error } = astrologerSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const exists = await Astrologer.findOne({ id: value.id });
    if (exists) return res.status(400).json({ message: "Astrologer id already exists" });

    const created = await Astrologer.create(value);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAstrologer = async (req, res) => {
  try {
    const { value, error } = astrologerSchema.validate({ ...req.body, id: Number(req.params.id) }, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const { id, ...updateBody } = value;

    const updated = await Astrologer.findOneAndUpdate({ id: Number(req.params.id) }, updateBody, { new: true });
    if (!updated) return res.status(404).json({ message: "Astrologer not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAstrologer = async (req, res) => {
  try {
    const deleted = await Astrologer.findOneAndDelete({ id: Number(req.params.id) });
    if (!deleted) return res.status(404).json({ message: "Astrologer not found" });
    return res.json({ message: "Astrologer deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
