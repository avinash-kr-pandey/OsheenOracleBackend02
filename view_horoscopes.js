import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    const Horoscope = mongoose.model(
      "Horoscope",
      new mongoose.Schema({}, { strict: false }),
      "horoscopes" // collection name
    );

    const data = await Horoscope.find({}).limit(5);
    console.log(`Found ${data.length} horoscopes:`);
    data.forEach((h) => {
      console.log({
        _id: h._id,
        zodiacSign: h.zodiacSign,
        prediction: h.prediction,
      });
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

runTest();
