import Joi from "joi";
import ReadingService from "../models/readingService.js";
import readingServicesData from "../utils/readingServicesData.js";

const serviceSchema = Joi.object({
  id: Joi.number().required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  pricing: Joi.string().allow('', null),
  image: Joi.string().allow('', null),
  theme: Joi.string().allow('', null),
});

export const getServices = async (req, res) => {
  try {
    let list = await ReadingService.find().lean();
    if (!list || list.length === 0) {
      await ReadingService.insertMany(readingServicesData);
      list = await ReadingService.find().lean();
    }
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getService = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await ReadingService.findOne({ id }).lean();
    if (!item) return res.status(404).json({ message: "Service not found" });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const { error } = serviceSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const exists = await ReadingService.findOne({ id: req.body.id });
    if (exists) return res.status(400).json({ message: "Service id already exists" });

    const created = await ReadingService.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { error } = serviceSchema.validate({ ...req.body, id: Number(req.params.id) });
    if (error) return res.status(400).json({ message: error.message });

    const updated = await ReadingService.findOneAndUpdate({ id: Number(req.params.id) }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Service not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const deleted = await ReadingService.findOneAndDelete({ id: Number(req.params.id) });
    if (!deleted) return res.status(404).json({ message: "Service not found" });
    return res.json({ message: "Service deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
