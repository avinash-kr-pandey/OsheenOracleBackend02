import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    period: { type: String, required: true },
    features: [{ type: String }],
    popular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("MembershipPlan", membershipPlanSchema);
