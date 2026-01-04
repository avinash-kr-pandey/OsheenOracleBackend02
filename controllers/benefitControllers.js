import Joi from "joi";
import Benefit from "../models/benefit.js";
import benefitsData from "../utils/benefitsData.js";

const benefitSchema = Joi.object({
  icon: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
});

export const getBenefits = async (req, res) => {
  try {
    let list = await Benefit.find().lean();

    if (!list || list.length === 0) {
      await Benefit.insertMany(benefitsData);
      list = await Benefit.find().lean();
    }

    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBenefit = async (req, res) => {
  try {
    const item = await Benefit.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: "Benefit not found" });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createBenefit = async (req, res) => {
  try {
    const { error } = benefitSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const created = await Benefit.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateBenefit = async (req, res) => {
  try {
    const { error } = benefitSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const updated = await Benefit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Benefit not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteBenefit = async (req, res) => {
  try {
    const deleted = await Benefit.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Benefit not found" });
    return res.json({ message: "Benefit deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
