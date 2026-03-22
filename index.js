// Routes
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
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
import uploadRoutes from "./routes/uploadRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import manifestationRoutes from "./routes/manifestationRoutes.js";
import spellTypeRoutes from "./routes/spellTypeRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import homeRoutes from "./routes/homeRoutes.js"; // Only ONE import
import dotenv from "dotenv";
import connectDB from "./db/config.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// ======================
// SWAGGER CONFIGURATION
// ======================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Osheen Oracle API",
      version: "1.0.0",
      description: "API documentation for Osheen Oracle Backend",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// ======================
// CORS CONFIGURATION
// ======================
const allowedOrigins = [
  "http://localhost:3000",
  "https://osheen-oracle-website2-0.vercel.app",
  "https://osheen-oracle-website-updated.vercel.app",
  "https://osheen-oracle-dashboard.vercel.app",
];

const cleanedAllowedOrigins = allowedOrigins.map(origin => origin.replace(/\/$/, ''));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (cleanedAllowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ======================
// REQUEST LOGGING
// ======================
app.use((req, res, next) => {
  console.log(`\n=== ${new Date().toISOString()} ===`);
  console.log(`${req.method} ${req.url}`);
  console.log("Origin:", req.headers.origin);
  console.log("User-Agent:", req.headers["user-agent"]);
  next();
});

// ======================
// OTHER MIDDLEWARES
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ======================
// SWAGGER DOCS
// ======================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

// ======================
// API ROUTES
// ======================
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
app.use("/api/uploads", uploadRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/manifestation-steps", manifestationRoutes);
app.use("/api/spell-types", spellTypeRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api", homeRoutes); // Home routes mounted here

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running...",
    environment: process.env.NODE_ENV,
    allowedOrigins: cleanedAllowedOrigins,
    timestamp: new Date().toISOString(),
    endpoints: {
      home: "/api/home",
      adminHome: "/api/admin/home",
      docs: "/api-docs"
    }
  });
});

// ======================
// CORS TEST ENDPOINT
// ======================
app.get("/api/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`,
  });
});

// ======================
// GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: "CORS Error: Origin not allowed",
      allowedOrigins: cleanedAllowedOrigins,
      yourOrigin: req.headers.origin,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`   
🚀 Server running on port ${PORT}
🔧 Environment: ${process.env.NODE_ENV || "development"}
🌐 Allowed Origins: ${cleanedAllowedOrigins.join(", ")}
📊 API Docs: http://localhost:${PORT}/api-docs
🩺 Health Check: http://localhost:${PORT}/
🏠 Home API: http://localhost:${PORT}/api/home
🔐 Admin Home API: http://localhost:${PORT}/api/admin/home
  `);
});