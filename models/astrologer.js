import mongoose from "mongoose";

const astrologerSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    experience: String,
    specialization: String,
    rating: Number,
    reviews: Number,
    expertise: [String],
    languages: [String],
    image: String,
    whatsappNumber: String,
    about: String,
    successRate: String,
    clientsHelped: String,
    consultationFee: String,
    responseTime: String,
    availability: String,
    skills: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Astrologer", astrologerSchema);
