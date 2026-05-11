import Announcement from "../models/Announcement.js";

// @desc    Get latest active announcement
// @route   GET /api/announcements/latest
// @access  Public
export const getLatestAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.getLatest();
    res.status(200).json({
      success: true,
      data: announcement || { content: "" },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcement",
      error: error.message,
    });
  }
};

// @desc    Create or Update announcement
// @route   POST /api/announcements
// @access  Private/Admin
export const createOrUpdateAnnouncement = async (req, res) => {
  try {
    const { content, isActive, link } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    // Since we usually only want one active announcement, we can either update the last one or create a new one and deactivate others.
    // For simplicity, let's just update the most recent one if it exists, or create a new one.
    let announcement = await Announcement.findOne().sort({ createdAt: -1 });

    if (announcement) {
      announcement.content = content;
      if (isActive !== undefined) announcement.isActive = isActive;
      if (link !== undefined) announcement.link = link;
      await announcement.save();
    } else {
      announcement = await Announcement.create({ content, isActive, link });
    }

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating announcement",
      error: error.message,
    });
  }
};

// @desc    Get all announcements (Admin)
// @route   GET /api/announcements
// @access  Private/Admin
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    });
  }
};
