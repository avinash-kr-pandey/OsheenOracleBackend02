import ManifestationStep from "../models/manifestationStep.js";

export const createManifestationStep = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const step = await ManifestationStep.create(req.body);

    res.status(201).json({
      success: true,
      message: "Manifestation step created",
      data: step,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getManifestationSteps = async (req, res) => {
  try {
    const steps = await ManifestationStep.find();

    res.status(200).json({
      success: true,
      count: steps.length,
      data: steps,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getManifestationStep = async (req, res) => {
  try {
    const step = await ManifestationStep.findById(req.params.id);

    if (!step) return res.status(404).json({ success: false, message: "Manifestation step not found" });

    res.status(200).json({ success: true, data: step });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateManifestationStep = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const step = await ManifestationStep.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!step) return res.status(404).json({ success: false, message: "Manifestation step not found" });

    res.status(200).json({ success: true, data: step });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteManifestationStep = async (req, res) => {
  try {
    const step = await ManifestationStep.findByIdAndDelete(req.params.id);

    if (!step) return res.status(404).json({ success: false, message: "Manifestation step not found" });

    res.status(200).json({ success: true, message: "Manifestation step deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};