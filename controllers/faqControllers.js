import Joi from "joi";
import FAQ from "../models/faq.js";
import faqsData from "../utils/faqsData.js";

const faqSchema = Joi.object({
  question: Joi.string().required(),
  answer: Joi.string().required(),
});

export const getFAQs = async (req, res) => {
  try {
    let list = await FAQ.find().lean();
    if (!list || list.length === 0) {
      await FAQ.insertMany(faqsData);
      list = await FAQ.find().lean();
    }
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFAQ = async (req, res) => {
  try {
    const item = await FAQ.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: "FAQ not found" });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { error } = faqSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const created = await FAQ.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { error } = faqSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const updated = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "FAQ not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const deleted = await FAQ.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "FAQ not found" });
    return res.json({ message: "FAQ deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
