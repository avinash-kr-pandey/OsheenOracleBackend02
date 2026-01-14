import mongoose from "mongoose";

const readingPackageSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: String },
    duration: { type: String },
    features: [{ type: String }],
    bestFor: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("ReadingPackage", readingPackageSchema);
