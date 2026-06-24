import mongoose from "mongoose";

// default size options: S, M, L, XL
const defaultSizes = ["S", "M", "L", "XL"];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true }, 
    originalPrice: { type: Number, required: true }, 
    image: { type: String, required: true },
    images: [{ type: String }], // Multiple images support
    video: { type: String }, // Video path/link support
    discount: { type: String }, // "30% off"
    description: { type: String },
    category: { type: String },
    inStock: { type: Boolean, default: true },
    gender: { type: String, enum: ["Male", "Female", "Unisex"], default: "Unisex" }, // Gender selection

    // Color option controlled by admin
    hasColorOptions: { type: Boolean, default: false },
    colors: [{ type: String }],

    // Size options (defaults to ["S", "M", "L", "XL"])
    sizeOptions: { type: [String], default: defaultSizes },

    // Size-wise pricing details
    sizePrices: [
      {
        size: { type: String },
        price: { type: Number },
        originalPrice: { type: Number }
      }
    ],

    // Reviews added by admin
    reviews: [
      {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String }, // Custom reviewer name
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
