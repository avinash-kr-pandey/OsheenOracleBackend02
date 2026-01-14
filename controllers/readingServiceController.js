import ReadingService from "../models/readingService.js";

// Create a new reading service
export const createReadingService = async (req, res) => {
  try {
    const service = await ReadingService.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reading services
export const getReadingServices = async (req, res) => {
  try {
    const services = await ReadingService.find().sort({ createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single reading service
export const getReadingService = async (req, res) => {
  try {
    const service = await ReadingService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update reading service
export const updateReadingService = async (req, res) => {
  try {
    const service = await ReadingService.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete reading service
export const deleteReadingService = async (req, res) => {
  try {
    const service = await ReadingService.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
