import mongoose from "mongoose";

const zodiacSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameHindi: { type: String, required: true },

    symbol: { type: String, required: true },
    icon: { type: String, required: true },

    dates: { type: String, required: true },
    datesHindi: { type: String, required: true },

    element: { type: String, required: true },
    elementHindi: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Zodiac", zodiacSchema);
