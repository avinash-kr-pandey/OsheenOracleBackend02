import mongoose from "mongoose";

const rishiSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameHindi: { type: String, required: true },
    description: { type: String, required: true },
    descriptionHindi: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Rishi", rishiSchema);
