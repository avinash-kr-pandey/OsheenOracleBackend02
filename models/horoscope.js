import mongoose from "mongoose";

const horoscopeSchema = new mongoose.Schema(
  {
    rishiName: { type: String, required: true },
    rishiNameHindi: { type: String, required: true },

    zodiacSign: { type: String, required: true },
    zodiacSignHindi: { type: String, required: true },

    prediction: { type: String, required: true },
    predictionHindi: { type: String, required: true },

    timeFrame: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Horoscope", horoscopeSchema);
