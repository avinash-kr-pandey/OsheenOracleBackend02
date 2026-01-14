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

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true 
    },
    password: { 
      type: String, 
      // Not required for Google OAuth users
      // Add validation only for email/password users
      required: function() {
        return this.loginMethod === "email";
      }
    },
    type: { 
      type: String, 
      enum: ["user", "admin"], 
      default: "user" 
    },
    
    // Google OAuth fields
    googleId: {
      type: String,
      default: null,
      sparse: true // Allows null values while maintaining uniqueness
    },
    loginMethod: {
      type: String,
      enum: ["email", "google"],
      default: "email"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    
    // Addresses
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

// Index for Google OAuth
userSchema.index({ googleId: 1 }, { sparse: true });

// Static method to find or create user for Google OAuth
userSchema.statics.findOrCreate = async function(googleUser) {
  try {
    let user = await this.findOne({ email: googleUser.email });
    
    if (!user) {
      // Create new user
      user = new this({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId || null,
        avatar: googleUser.picture || "",
        loginMethod: "google",
        isVerified: true,
        password: null, // No password for Google users
      });
      
      await user.save();
      console.log(`✅ New Google user created: ${googleUser.email}`);
    } else if (!user.googleId && googleUser.googleId) {
      // Update existing user with Google ID
      user.googleId = googleUser.googleId;
      user.loginMethod = "google";
      user.isVerified = true;
      
      // Update avatar if not set
      if (!user.avatar && googleUser.picture) {
        user.avatar = googleUser.picture;
      }
      
      await user.save();
      console.log(`✅ Existing user updated with Google ID: ${googleUser.email}`);
    }
    
    return user;
  } catch (error) {
    console.error("Error in findOrCreate:", error);
    throw error;
  }
};

// Method to convert user to JSON (remove sensitive data)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.__v;
  return user;
};

// Virtual for frontend ID
userSchema.virtual("id").get(function() {
  return this._id.toString();
});

// Ensure virtuals are included in JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export default mongoose.model("User", userSchema);