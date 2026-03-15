import SpellType from "../models/spellType.js";

export const createSpellType = async (req, res) => {
  try {
    const { type, description, idealFor, icon } = req.body;

    if (!type || !description || !idealFor || !icon) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const spellType = await SpellType.create(req.body);

    res.status(201).json({
      success: true,
      message: "Spell type created",
      data: spellType,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSpellTypes = async (req, res) => {
  try {
    const spellTypes = await SpellType.find();

    res.status(200).json({
      success: true,
      count: spellTypes.length,
      data: spellTypes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getSpellType = async (req, res) => {
  try {
    const spellType = await SpellType.findById(req.params.id);

    if (!spellType) return res.status(404).json({ success: false, message: "Spell type not found" });

    res.status(200).json({ success: true, data: spellType });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateSpellType = async (req, res) => {
  try {
    const { type, description, idealFor, icon } = req.body;

    if (!type || !description || !idealFor || !icon) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const spellType = await SpellType.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!spellType) return res.status(404).json({ success: false, message: "Spell type not found" });

    res.status(200).json({ success: true, data: spellType });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteSpellType = async (req, res) => {
  try {
    const spellType = await SpellType.findByIdAndDelete(req.params.id);

    if (!spellType) return res.status(404).json({ success: false, message: "Spell type not found" });

    res.status(200).json({ success: true, message: "Spell type deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};