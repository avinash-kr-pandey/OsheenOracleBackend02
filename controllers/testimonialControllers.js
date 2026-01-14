import Joi from "joi";
import Testimonial from "../models/testimonial.js";
import testimonialsData from "../utils/testimonialsData.js";

const testimonialSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
  zodiac: Joi.string().allow('', null),
  rating: Joi.number().integer().min(0).max(5).allow(null),
  comment: Joi.string().required(),
  date: Joi.string().allow('', null),
});

export const getTestimonials = async (req, res) => {
  try {
    let list = await Testimonial.find().lean();
    if (!list || list.length === 0) {
      await Testimonial.insertMany(testimonialsData);
      list = await Testimonial.find().lean();
    }
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTestimonial = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await Testimonial.findOne({ id }).lean();
    if (!item) return res.status(404).json({ message: "Testimonial not found" });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const { error } = testimonialSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const exists = await Testimonial.findOne({ id: req.body.id });
    if (exists) return res.status(400).json({ message: "Testimonial id already exists" });

    const created = await Testimonial.create(req.body);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { error } = testimonialSchema.validate({ ...req.body, id: Number(req.params.id) });
    if (error) return res.status(400).json({ message: error.message });

    const updated = await Testimonial.findOneAndUpdate({ id: Number(req.params.id) }, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Testimonial not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const deleted = await Testimonial.findOneAndDelete({ id: Number(req.params.id) });
    if (!deleted) return res.status(404).json({ message: "Testimonial not found" });
    return res.json({ message: "Testimonial deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
