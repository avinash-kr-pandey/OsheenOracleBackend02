import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://osheen-oracle:osheenoracle2@osheenoracle.fmkrnoq.mongodb.net/bookshow?appName=OsheenOracle";

const schema = new mongoose.Schema({}, { strict: false });
const Home = mongoose.model("Home", schema, "homes");

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  
  const homeData = await Home.findOne();
  if (!homeData) {
    console.log("No home data found");
  } else {
    const raw = homeData.toObject();
    console.log("=== discoverSection ===");
    console.log(JSON.stringify(raw.discoverSection, null, 2));
    
    console.log("=== discoverYourPath ===");
    if (raw.discoverYourPath) {
      raw.discoverYourPath.forEach(item => {
        console.log(`- Path: "${item.title}", Image: "${item.image}"`);
      });
    }
    
    console.log("=== mediaSpotlight ===");
    if (raw.mediaSpotlight) {
      raw.mediaSpotlight.forEach(item => {
        console.log(`- Media: "${item.title}", Image: "${item.image}"`);
      });
    }
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
