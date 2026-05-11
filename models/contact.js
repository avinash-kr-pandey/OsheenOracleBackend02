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
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
      trim: true,
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
      enum: ["pending", "contacted", "closed"],
      default: "pending",
    },

    // Admin Notes
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

// Method to update status
contactSchema.methods.updateStatus = async function (newStatus) {
  this.status = newStatus;
  this.updatedAt = Date.now();
  await this.save();
  return this;
};

// Static method to get pending contacts
contactSchema.statics.getPendingContacts = async function () {
  return await this.find({ status: "pending" }).sort({ createdAt: 1 });
};

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
