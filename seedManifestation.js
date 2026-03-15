import mongoose from "mongoose";
import dotenv from "dotenv";
import ManifestationStep from "../models/manifestationStep.js";
import connectDB from "../db/config.js";

dotenv.config();
connectDB();

const seedData = [
  {
    title: "Clarity of Intention",
    description: "Knowing exactly what you want and why you want it",
  },
  {
    title: "Emotional Energy",
    description: "Feeling your desire with belief, passion, and presence",
  },
  {
    title: "Spiritual Alignment",
    description: "Calling on divine forces to co-create with you",
  },
];

const seedManifestationSteps = async () => {
  try {
    await ManifestationStep.deleteMany(); // Clear existing data
    await ManifestationStep.insertMany(seedData);
    console.log("Manifestation steps seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedManifestationSteps();