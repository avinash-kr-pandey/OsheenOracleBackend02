import mongoose from "mongoose";

const readingServiceSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    pricing: { type: String },
    image: { type: String },
    theme: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("ReadingService", readingServiceSchema);
