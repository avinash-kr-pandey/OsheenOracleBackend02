import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import connectDB from "./db/config.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import zodiacRoutes from "./routes/zodiacRoutes.js";
import rishiRoutes from "./routes/rishiRoutes.js";
import horoscopeRoutes from "./routes/horoscopeRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import benefitRoutes from "./routes/benefitRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import astrologerRoutes from "./routes/astrologerRoutes.js";
import readingPackageRoutes from "./routes/readingPackageRoutes.js";
import readingServiceRoutes from "./routes/readingServiceRoutes.js";


dotenv.config();
connectDB();

const app = express();


// Middlewares
// app.use(cors({ origin: "*", credentials: true }));
app.use(cors({
  origin: process.env.CLIENT_URL, // FRONTEND URL from .env
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// expose raw swagger JSON for quick inspection
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/zodiacs", zodiacRoutes);
app.use("/api/rishis", rishiRoutes);
app.use("/api/horoscope", horoscopeRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/benefits", benefitRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/astrologers", astrologerRoutes);
app.use("/api/reading-packages", readingPackageRoutes);
app.use("/api/reading-services", readingServiceRoutes);
// Health Check Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global Error Handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
