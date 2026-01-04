import User from "../models/user.js";

export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "Not authorized" });

    if (user.type !== "admin") return res.status(403).json({ message: "Admin only" });

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};