import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    totalAmount: { type: Number },
    status: {
      type: String,
      enum: ["Pending", "Packed", "Shipped", "Reached", "Cancelled"],
      default: "Pending",
      set: function (val) {
        if (typeof val !== "string") return val;
        const trimmed = val.trim();
        const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        if (normalized === "Delivered") return "Reached";
        if (normalized === "Processing") return "Packed";
        return normalized;
      },
    },
    image: { type: String },
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
    },
    phone: { type: String },
    paymentMethod: { type: String, default: "Razorpay" },
    paymentId: { type: String },

    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
