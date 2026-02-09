import About from "../models/about.js";

const allowedFields = [
  "heroTitle",
  "heroDescription",
  "mission",
  "vision",
  "stats",
  "sections",
];

export const getAbout = async (req, res) => {
  try {
    let about = await About.findOne();

    if (!about) {
      about = await About.create({});
    }

    return res.json({ success: true, data: about });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const updateAbout = async (req, res) => {
  try {
    let about = await About.findOne();

    if (!about) {
      about = new About({});
    }

    // Only update allowed fields
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    Object.assign(about, updates);

    await about.save();

    return res.json({ success: true, message: "About Page data updated successfully" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
