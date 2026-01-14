import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    zodiac: { type: String },
    rating: { type: Number },
    comment: { type: String, required: true },
    date: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);
