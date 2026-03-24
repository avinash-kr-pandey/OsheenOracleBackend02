import mongoose from "mongoose";

// Membership Application Schema
const becomeAMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true;
        const phoneDigits = v.replace(/\D/g, "");
        return phoneDigits.length >= 10;
      },
      message: "Phone number must be at least 10 digits",
    },
  },
  countryCode: {
    type: String,
    default: "+91",
    trim: true,
  },
  plan: {
    type: String,
    required: [true, "Plan selection is required"],
    enum: [
      "basic-aura",
      "tarot-insight",
      "healing-energy",
      "premium-manifestation",
    ],
  },
  newsletter: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ["pending", "contacted", "active", "cancelled", "inactive"],
    default: "pending",
  },
  notes: {
    type: String,
    trim: true,
  },
  contactHistory: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      type: {
        type: String,
        enum: ["email", "whatsapp", "call", "other"],
        required: true,
      },
      notes: String,
      contactedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  lastContacted: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Dynamic Content Schemas
const membershipPlanSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    period: {
      type: String,
      enum: ["month", "quarter", "year"],
      default: "month",
    },
    features: [{ type: String }],
    popular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const benefitSchema = new mongoose.Schema(
  {
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const testimonialSchema = new mongoose.Schema(
  {
    avatar: { type: String, required: true },
    content: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const addOnSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    price: { type: String, required: true },
    description: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const statSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    label: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Update timestamp on save
becomeAMemberSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full phone number
becomeAMemberSchema.virtual("fullPhoneNumber").get(function () {
  return this.phone ? `${this.countryCode} ${this.phone}` : null;
});

// Method to mark as contacted
becomeAMemberSchema.methods.markContacted = async function (
  type,
  notes,
  userId,
) {
  this.contactHistory.push({
    type,
    notes,
    contactedBy: userId,
  });
  this.lastContacted = Date.now();
  await this.save();
};

// Method to activate subscription
becomeAMemberSchema.methods.activateSubscription = async function (
  duration = "month",
) {
  this.status = "active";
  this.subscriptionStartDate = Date.now();

  const endDate = new Date();
  if (duration === "month") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (duration === "quarter") {
    endDate.setMonth(endDate.getMonth() + 3);
  } else if (duration === "year") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  this.subscriptionEndDate = endDate;

  await this.save();
};

// ✅ FIX: Check if models already exist before creating
const BecomeAMember =
  mongoose.models.BecomeAMember ||
  mongoose.model("BecomeAMember", becomeAMemberSchema);
const MembershipPlan =
  mongoose.models.MembershipPlan ||
  mongoose.model("MembershipPlan", membershipPlanSchema);
const Benefit =
  mongoose.models.Benefit || mongoose.model("Benefit", benefitSchema);
const Testimonial =
  mongoose.models.Testimonial ||
  mongoose.model("Testimonial", testimonialSchema);
const AddOn = mongoose.models.AddOn || mongoose.model("AddOn", addOnSchema);
const Stat = mongoose.models.Stat || mongoose.model("Stat", statSchema);

export { BecomeAMember, MembershipPlan, Benefit, Testimonial, AddOn, Stat };
