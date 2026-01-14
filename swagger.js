import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "API documentation for Auth, Products, Orders, etc.",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    tags: [
      {
        name: "Astrologers",
        description: "Astrologer API Endpoints",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            type: { type: "string", enum: ["user", "admin"], default: "user" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
        Product: {
          type: "object",
          required: ["name", "price", "originalPrice", "image"],
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            price: { type: "number" },
            originalPrice: { type: "number" },
            image: { type: "string" },
            discount: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            inStock: { type: "boolean" },
            hasColorOptions: { type: "boolean" },
            colors: { type: "array", items: { type: "string" } },
            sizeOptions: { type: "array", items: { type: "number" } },
            reviews: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  admin: { type: "string" },
                  rating: { type: "number" },
                  comment: { type: "string" },
                  createdAt: { type: "string" },
                },
              },
            },
            averageRating: { type: "number" },
            reviewCount: { type: "number" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },

        Order: {
          type: "object",
          properties: {
            _id: { type: "string" },
            user: { type: "string" },
            productName: { type: "string" },
            price: { type: "number" },
            status: { type: "string", enum: ["Pending", "Shipped", "Delivered", "Cancelled"] },
            image: { type: "string" },
            date: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
        Address: {
          type: "object",
          required: ["type", "name", "address", "phone"],
          properties: {
            _id: { type: "string" },
            type: { type: "string", description: "Home, Work, Other" },
            name: { type: "string" },
            address: { type: "string" },
            phone: { type: "string" },
            isDefault: { type: "boolean" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
        Zodiac: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            symbol: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            element: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
        Rishi: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            biography: { type: "string" },
            era: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
        Horoscope: {
          type: "object",
          properties: {
            _id: { type: "string" },
            sign: { type: "string" },
            date: { type: "string" },
            prediction: { type: "string" },
            timeFrame: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
        ReadingService: {
          type: "object",
          required: ["title", "content"],
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            pricing: { type: "string" },
            image: { type: "string" },
            theme: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
        Astrologer: {
          type: "object",
          required: ["id", "name"],
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            experience: { type: "string" },
            specialization: { type: "string" },
            rating: { type: "number" },
            reviews: { type: "integer" },
            expertise: { type: "array", items: { type: "string" } },
            languages: { type: "array", items: { type: "string" } },
            image: { type: "string" },
            whatsappNumber: { type: "string" },
            about: { type: "string" },
            successRate: { type: "string" },
            clientsHelped: { type: "string" },
            consultationFee: { type: "string" },
            responseTime: { type: "string" },
            availability: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
      },
    },
  },

  // IMPORTANT – absolute paths so swagger scans all files
  apis: [
    path.join(__dirname, "routes/*.js"),
    path.join(__dirname, "controllers/*.js"),
    path.join(__dirname, "models/*.js"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
