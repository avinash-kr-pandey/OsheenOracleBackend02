import mongoose from "mongoose";

const horoscopeSchema = new mongoose.Schema(
  {
    // Rishi information
    rishiName: { type: String, required: false },
    rishiNameHindi: { type: String, required: false },

    // Zodiac information
    zodiacSign: { type: String, required: true },
    zodiacSignHindi: { type: String, required: false },

    // Date for the prediction
    date: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split("T")[0], 
    },

    // Prediction content
    prediction: { type: String, required: true },
    predictionHindi: { type: String, required: false },

    // Time frame
    timeFrame: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
      default: "daily",
    },
  },
  {
    timestamps: true,
  },
);

// Add index for better query performance
horoscopeSchema.index({ zodiacSign: 1, date: 1, timeFrame: 1 });

export default mongoose.model("Horoscope", horoscopeSchema);
