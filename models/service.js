import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String, // e.g., "30 mins", "1 hour", "2 hours"
      default: "1 hour",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    image: {
      type: String,
      default: "",
    },
    // For sorting/ordering
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual for frontend
serviceSchema.virtual("id").get(function () {
  return this._id.toString();
});

serviceSchema.set("toJSON", { virtuals: true });
serviceSchema.set("toObject", { virtuals: true });

const Service =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

export default Service;
