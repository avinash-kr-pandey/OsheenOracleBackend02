import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    // User information (can be from logged-in user or guest)
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

    // Service details
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceName: {
      type: String, // Denormalized for quick access
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
      type: String, // e.g., "morning", "afternoon", "evening"
      default: null,
    },

    // Admin notes
    adminNotes: {
      type: String,
      default: "",
    },

    // For anonymous users (not logged in)
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
serviceRequestSchema.index({ service: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ email: 1 });

// Virtual for frontend
serviceRequestSchema.virtual("id").get(function () {
  return this._id.toString();
});

serviceRequestSchema.set("toJSON", { virtuals: true });
serviceRequestSchema.set("toObject", { virtuals: true });

const ServiceRequest =
  mongoose.models.ServiceRequest ||
  mongoose.model("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;
