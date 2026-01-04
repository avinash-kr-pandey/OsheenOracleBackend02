import Joi from "joi";
import MembershipPlan from "../models/membershipPlan.js";
import membershipData from "../utils/membershipData.js";

const planSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.string().required(),
  period: Joi.string().required(),
  features: Joi.array().items(Joi.string()),
  popular: Joi.boolean(),
});

export const getPlans = async (req, res) => {
  try {
    let plans = await MembershipPlan.find().lean();

    // Seed default plans if DB is empty
    if (!plans || plans.length === 0) {
      await MembershipPlan.insertMany(membershipData);
      plans = await MembershipPlan.find().lean();
    }

    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findOne({ id: req.params.id }).lean();
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    return res.json(plan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { error } = planSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const exists = await MembershipPlan.findOne({ id: req.body.id });
    if (exists) return res.status(400).json({ message: "Plan id already exists" });

    const plan = await MembershipPlan.create(req.body);
    return res.status(201).json(plan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { error } = planSchema.validate({ ...req.body, id: req.params.id });
    if (error) return res.status(400).json({ message: error.message });

    const plan = await MembershipPlan.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    if (!plan) return res.status(404).json({ message: "Plan not found" });
    return res.json(plan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findOneAndDelete({ id: req.params.id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    return res.json({ message: "Plan deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
