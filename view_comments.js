import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // Import actual model
    import("./models/Comment.js").then(async (m) => {
      const Comment = m.default;
      
      const blogIdStr = "69fceeefcba4c5d64fb223ab";
      console.log(`Querying comments for blogId string: ${blogIdStr}`);
      
      const comments = await Comment.find({
        blogId: blogIdStr,
        isApproved: true,
      });
      
      console.log(`Found ${comments.length} approved comments:`);
      console.log(comments);
      
      await mongoose.disconnect();
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

runTest();
