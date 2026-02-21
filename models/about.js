import mongoose from "mongoose";


const aboutSchema = new mongoose.Schema(
  {
    heroTitle: String,
    heroDescription: String,

    mission: String,
    vision: String,
    stats: [
      {
        label: String,
        value: String,
      },
    ],

    sections: [
      {
        title: String,
        content: String,
        image: String,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("About", aboutSchema);
