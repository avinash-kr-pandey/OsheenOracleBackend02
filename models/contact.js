import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    // Personal Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[+]?[\d\s-]{10,15}$/, "Please enter a valid phone number"],
    },

    // Consultation Details
    desiredDate: {
      type: Date,
      required: [true, "Desired date is required"],
    },
    desiredTime: {
      type: String,
      required: [true, "Desired time is required"],
      trim: true,
    },
    additionalMessage: {
      type: String,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
      trim: true,
    },

    // Astrologer Information
    preferredAstrologer: {
      type: String,
      trim: true,
      default: null,
    },
    astrologerSpecialization: {
      type: String,
      enum: [
        "Vedic",
        "Tarot",
        "Numerology",
        "Palmistry",
        "Vastu",
        "General",
        null,
      ],
      default: null,
    },
    assignedAstrologer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Consultation Type
    consultationType: {
      type: String,
      enum: ["chat", "call", "video", "in_person"],
      default: "call",
    },
    consultationDuration: {
      type: Number,
      enum: [15, 30, 45, 60],
      default: 30,
    },

    // User Information (if logged in)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Status Management
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      default: "pending",
    },

    // Admin/Astrologer Notes
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
    astrologerNotes: {
      type: String,
      trim: true,
      default: "",
    },

    // Payment Information
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },
    paymentAmount: {
      type: Number,
      default: null,
    },
    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    // Meeting/Call Details
    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },
    callScheduledTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ desiredDate: 1 });
contactSchema.index({ assignedAstrologer: 1 });
contactSchema.index({ createdAt: -1 });

// Virtual for checking if consultation is upcoming
contactSchema.virtual("isUpcoming").get(function () {
  return this.status === "confirmed" && new Date(this.desiredDate) > new Date();
});

// Method to update status
contactSchema.methods.updateStatus = async function (newStatus) {
  this.status = newStatus;
  this.updatedAt = Date.now();
  await this.save();
  return this;
};

// Method to assign astrologer
contactSchema.methods.assignAstrologer = async function (
  astrologerId,
  astrologerNotes = "",
) {
  this.assignedAstrologer = astrologerId;
  this.status = "confirmed";
  this.astrologerNotes = astrologerNotes;
  this.updatedAt = Date.now();
  await this.save();
  return this;
};

// Static method to get pending consultations
contactSchema.statics.getPendingConsultations = async function () {
  return await this.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .populate("assignedAstrologer", "name email phone type");
};

// Static method to get todays consultations
contactSchema.statics.getTodaysConsultations = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await this.find({
    desiredDate: { $gte: today, $lt: tomorrow },
    status: { $in: ["confirmed", "in_progress"] },
  }).populate("assignedAstrologer", "name email phone type");
};

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
