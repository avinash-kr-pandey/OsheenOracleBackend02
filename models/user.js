import mongoose from "mongoose";


const addressSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // Home, Work, Other
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: String, enum: ["user", "admin"], default: "user" },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
    addresses: [addressSchema],
}, {
    timestamps: true, // <-- adds createdAt & updatedAt automatically
  });       





export default mongoose.model("User", userSchema);
