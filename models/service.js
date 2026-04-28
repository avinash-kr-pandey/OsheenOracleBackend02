import mongoose from "mongoose";

// Subcategory Schema
const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  duration: {
    type: String, // e.g., "15 mins", "30 mins", "1 hour"
    default: "30 mins",
  },
  icon: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Main Category Schema
const categorySchema = new mongoose.Schema(
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
    icon: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subcategories: [subcategorySchema],
  },
  {
    timestamps: true,
  },
);

// Virtual for frontend ID
categorySchema.virtual("id").get(function () {
  return this._id.toString();
});

categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

// Service Request Schema
const serviceRequestSchema = new mongoose.Schema(
  {
    // User information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },

    // Service details (denormalized for quick access)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    subcategory: {
      type: Object, // Store the subcategory object
      required: true,
    },
    subcategoryName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    // Communication preference
    communicationMode: {
      type: String,
      enum: ["voice_call", "video_call", "voice_note"],
      required: true,
    },

    // Additional details
    description: {
      type: String,
      required: true,
    },

    // Request status tracking
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    // Preferred date and time (optional)
    preferredDate: {
      type: Date,
      default: null,
    },
    preferredTimeSlot: {
      type: String,
      default: null,
    },

    // Admin notes
    adminNotes: {
      type: String,
      default: "",
    },

    // For anonymous users
    isGuest: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
serviceRequestSchema.index({ user: 1 });
serviceRequestSchema.index({ category: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ email: 1 });

serviceRequestSchema.virtual("id").get(function () {
  return this._id.toString();
});

serviceRequestSchema.set("toJSON", { virtuals: true });
serviceRequestSchema.set("toObject", { virtuals: true });

const Service =
  mongoose.models.Service || mongoose.model("Service", categorySchema);
const ServiceRequest =
  mongoose.models.ServiceRequest ||
  mongoose.model("ServiceRequest", serviceRequestSchema);

export { Service, ServiceRequest };
