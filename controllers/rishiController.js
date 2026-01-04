import Rishi from "../models/rishi.js";

// Add a new Rishi
export const addRishi = async (req, res) => {
  try {
    const rishi = await Rishi.create(req.body);
    res.status(201).json({ message: "Rishi added", rishi });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all rishis
export const getRishis = async (req, res) => {
  try {
    const data = await Rishi.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single rishi
export const getRishi = async (req, res) => {
  try {
    const rishi = await Rishi.findById(req.params.id);
    if (!rishi) return res.status(404).json({ message: "Rishi not found" });

    res.json(rishi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
