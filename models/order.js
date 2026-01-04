import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    image: { type: String },

    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
