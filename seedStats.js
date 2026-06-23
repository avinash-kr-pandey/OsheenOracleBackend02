import mongoose from "mongoose";
import dotenv from "dotenv";
import { Stat } from "./models/becomeamember.js";

dotenv.config();

const newStats = [
  { number: "10+", label: "Years of Experience", isActive: true, order: 1 },
  { number: "5000+", label: "Happy Lives", isActive: true, order: 2 },
  { number: "1000+", label: "Kundli Analysis Completed", isActive: true, order: 3 },
  { number: "95%", label: "Client Satisfaction Rate", isActive: true, order: 4 },
];

async function seed() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    console.log("Deleting old stats...");
    await Stat.deleteMany({});
    console.log("Old stats deleted.");

    console.log("Inserting new stats...");
    await Stat.insertMany(newStats);
    console.log("New stats inserted successfully!");

  } catch (error) {
    console.error("Error seeding stats:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

seed();
