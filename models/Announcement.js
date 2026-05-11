import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Helper to get the latest active announcement
announcementSchema.statics.getLatest = async function () {
  return await this.findOne({ isActive: true }).sort({ createdAt: -1 });
};

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
