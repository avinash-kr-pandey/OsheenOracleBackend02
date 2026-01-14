import Joi from "joi";
import ReadingPackage from "../models/readingPackage.js";
import readingPackagesData from "../utils/readingPackagesData.js";

const packageSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
  price: Joi.string().allow('', null),
  duration: Joi.string().allow('', null),
  features: Joi.array().items(Joi.string()),
  bestFor: Joi.string().allow('', null),
});

export const getPackages = async (req, res) => {
  try {
    let list = await ReadingPackage.find().lean();
    if (!list || list.length === 0) {
      await ReadingPackage.insertMany(readingPackagesData);
      list = await ReadingPackage.find().lean();
    }
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPackage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await ReadingPackage.findOne({ id }).lean();
    if (!item) return res.status(404).json({ message: "Package not found" });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createPackage = async (req, res) => {
  try {
    const { error } = packageSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const exists = await ReadingPackage.findOne({ id: req.body.id });
    if (exists) return res.status(400).json({ message: "Package id already exists" });

    const created = await ReadingPackage.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const { error } = packageSchema.validate({ ...req.body, id: Number(req.params.id) });
    if (error) return res.status(400).json({ message: error.message });

    const updated = await ReadingPackage.findOneAndUpdate({ id: Number(req.params.id) }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Package not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const deleted = await ReadingPackage.findOneAndDelete({ id: Number(req.params.id) });
    if (!deleted) return res.status(404).json({ message: "Package not found" });
    return res.json({ message: "Package deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
