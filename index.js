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
import homeRoutes from "./routes/homeRoutes.js";
import dotenv from "dotenv";
import connectDB from "./db/config.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import becomeAMemberRoutes from "./routes/becomeamemberRoutes.js";
import fs from "fs";

// ✅ Import service routes
import serviceRoutes from "./routes/serviceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
// ✅ Load environment variables FIRST

// Contact

import contactRoutes from "./routes/contactRoutes.js"


dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ======================
// DATABASE CONNECTION (WITH AWAIT)
// ======================
(async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
})();

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
        url: `${process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`}`,
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
  "http://localhost:3001",
  "https://osheen-oracle-website2-0.vercel.app",
  "https://osheen-oracle-website-updated.vercel.app",
  "https://osheen-oracle-dashboard.vercel.app",
  "https://yourdomain.com", // Add your Hostinger domain
  process.env.FRONTEND_URL, // Add from .env
].filter(Boolean);

const cleanedAllowedOrigins = allowedOrigins.map((origin) =>
  origin.replace(/\/$/, ""),
);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }
    if (
      cleanedAllowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV !== "production"
    ) {
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

// ======================
// UPLOADS DIRECTORY SETUP (IMPORTANT FOR HOSTINGER)
// ======================
const setupUploadsDirectory = () => {
  // Try multiple possible paths for Hostinger
  const possiblePaths = [
    path.join(__dirname, "uploads"),
    path.join(__dirname, "public", "uploads"),
    "/var/www/uploads",
    "/home/u123456789/public_html/uploads", // Replace with your actual path
    path.join(process.cwd(), "uploads"),
    path.join(process.cwd(), "public", "uploads"),
  ];

  let uploadsPath = null;

  for (const dirPath of possiblePaths) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created uploads directory: ${dirPath}`);
      } else {
        console.log(`✅ Uploads directory exists: ${dirPath}`);
      }

      // Create subdirectories
      const imagesDir = path.join(dirPath, "images");
      const videosDir = path.join(dirPath, "videos");
      const documentsDir = path.join(dirPath, "documents");

      [imagesDir, videosDir, documentsDir].forEach((subDir) => {
        if (!fs.existsSync(subDir)) {
          fs.mkdirSync(subDir, { recursive: true });
        }
      });

      uploadsPath = dirPath;
      break;
    } catch (err) {
      console.log(`Cannot create/access ${dirPath}:`, err.message);
    }
  }

  return uploadsPath;
};

const uploadsPath = setupUploadsDirectory();
console.log(`📁 Using uploads directory: ${uploadsPath}`);

// ======================
// SERVE STATIC FILES (MULTIPLE LOCATIONS FOR FLEXIBILITY)
// ======================
// Serve from local uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Serve from absolute path if exists
if (uploadsPath && uploadsPath !== path.join(__dirname, "uploads")) {
  app.use("/uploads", express.static(uploadsPath));
}

// For Hostinger absolute path
if (fs.existsSync("/var/www/uploads")) {
  app.use("/uploads", express.static("/var/www/uploads"));
}

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
app.use("/api", homeRoutes);
app.use("/api/becomeamember", becomeAMemberRoutes);

// ✅ Service routes
app.use("/api/services", serviceRoutes);

// Paymet routes

app.use("/api/payment", paymentRoutes);

// Contact 

app.use("/api/contact",  contactRoutes)


// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running...",
    environment: process.env.NODE_ENV,
    uploadsPath: uploadsPath,
    allowedOrigins: cleanedAllowedOrigins,
    timestamp: new Date().toISOString(),
    endpoints: {
      home: "/api/home",
      adminHome: "/api/admin/home",
      docs: "/api-docs",
      services: "/api/services",
      serviceRequests: "/api/services/requests",
      categories: "/api/services/categories",
      upload: "/api/uploads/file-upload",
    },
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
// UPLOAD TEST ENDPOINT
// ======================
app.get("/api/upload-test", (req, res) => {
  const uploadDirs = {
    localUploads: fs.existsSync(path.join(__dirname, "uploads")),
    publicUploads: fs.existsSync(path.join(__dirname, "public", "uploads")),
    varWwwUploads: fs.existsSync("/var/www/uploads"),
    uploadsPath: uploadsPath,
    imagesDir: uploadsPath
      ? fs.existsSync(path.join(uploadsPath, "images"))
      : false,
    videosDir: uploadsPath
      ? fs.existsSync(path.join(uploadsPath, "videos"))
      : false,
  };

  res.json({
    success: true,
    message: "Upload directories status",
    directories: uploadDirs,
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

  // Handle multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 50MB",
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
📁 Uploads Directory: ${uploadsPath}
🌐 Allowed Origins: ${cleanedAllowedOrigins.join(", ")}
📊 API Docs: http://localhost:${PORT}/api-docs
🩺 Health Check: http://localhost:${PORT}/
🏠 Home API: http://localhost:${PORT}/api/home
🔐 Admin Home API: http://localhost:${PORT}/api/admin/home
✨ Services API: http://localhost:${PORT}/api/services
📝 Service Requests: http://localhost:${PORT}/api/services/requests
📂 Categories API: http://localhost:${PORT}/api/services/categories
📤 Upload API: http://localhost:${PORT}/api/uploads/file-upload
  `);
});
