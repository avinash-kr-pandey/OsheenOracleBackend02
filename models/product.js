import mongoose from "mongoose";

// default size options: S, M, L, XL
const defaultSizes = ["S", "M", "L", "XL"];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true }, 
    originalPrice: { type: Number, required: true }, 
    image: { type: String, required: true },
    discount: { type: String }, // "30% off"
    description: { type: String },
    category: { type: String },
    inStock: { type: Boolean, default: true },

    // Color option controlled by admin
    hasColorOptions: { type: Boolean, default: false },
    colors: [{ type: String }],

    // Size options (defaults to ["S", "M", "L", "XL"])
    sizeOptions: { type: [String], default: defaultSizes },

    // Reviews added by admin
    reviews: [
      {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
