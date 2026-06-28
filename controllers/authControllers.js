import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmauils.js";
import Joi from "joi";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ---------------- REGISTER ------------------
export const register = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      type: Joi.string().valid("user", "admin").optional(),
      adminSecret: Joi.string().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { name, email, password, type, adminSecret } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Determine user type with admin secret validation
    let userType = "user";
    let isVerified = false;

    if (type === "admin") {
      // Check admin secret key
      if (adminSecret && adminSecret === process.env.ADMIN_SECRET_KEY) {
        userType = "admin";
        isVerified = true; // Auto-verify admin users
      } else {
        return res.status(403).json({
          message: "Invalid admin secret key. Admin registration denied.",
        });
      }
    }

    const hashed = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP for non-admin users
    const otp = isVerified ? undefined : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = isVerified ? undefined : Date.now() + 10 * 60 * 1000; // 10 minutes

    if (user) {
      // Overwrite/update existing unverified user
      user.name = name;
      user.password = hashed;
      user.type = userType;
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: hashed,
        type: userType,
        loginMethod: "email",
        isVerified: isVerified,
        otp,
        otpExpire,
      });
    }

    if (!isVerified) {
      try {
        await sendEmail({
          email,
          name: name || "",
          subject: "Verify your email - Osheen Oracle",
          message: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
          templateId: "otp_template_34",
          variables: {
            otp,
            company_name: "Osheen Oracle",
            name: name || "User",
          }
        });
      } catch (err) {
        console.error("Error sending register verification email:", err);
        // Delete the created or updated user document to avoid stuck unverified states
        try {
          await User.deleteOne({ _id: user._id });
        } catch (delErr) {
          console.error("Failed to clean up user record on verification email failure:", delErr);
        }
        return res.status(500).json({
          message: "Failed to send verification email. Please try again.",
        });
      }
    }

    res.json({
      message: isVerified
        ? "Registration successful"
        : "Registration successful. Please verify your email using the OTP sent.",
      requiresOtp: !isVerified,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- LOGIN ------------------
export const login = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if user has password (for Google users)
    if (!user.password && user.loginMethod === "google") {
      return res.status(400).json({
        message:
          "This account was created with Google. Please login with Google.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    // Check if user is verified
    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();

      try {
        await sendEmail({
          email: user.email,
          name: user.name || "",
          subject: "Verify your email - Osheen Oracle",
          message: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
          templateId: "otp_template_34",
          variables: {
            otp,
            company_name: "Osheen Oracle",
            name: user.name || "User",
          }
        });
      } catch (err) {
        console.error("Error sending login verification email:", err);
      }

      return res.status(403).json({
        message: "Your email is not verified. An OTP has been sent to your email.",
        requiresOtp: true,
        email: user.email,
      });
    }

    // Generate token with user type included
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        type: user.type,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        isVerified: user.isVerified,
        loginMethod: user.loginMethod,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GOOGLE LOGIN ------------------
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token missing",
      });
    }

    console.log("🔍 Verifying Google token...");

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    console.log("✅ Google verified:", { email, name });

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        avatar: picture || "",
        loginMethod: "google",
        isVerified: true,
        type: "user", // Default type for Google users
      });
      await user.save();
      console.log(`✅ New Google user created: ${email}`);
    } else if (!user.googleId && googleId) {
      // Update existing user with Google ID
      user.googleId = googleId;
      user.loginMethod = "google";
      user.isVerified = true;
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();
      console.log(`✅ Existing user updated with Google ID: ${email}`);
    }

    // Generate JWT with user type
    const jwtToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        type: user.type,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );

    console.log("✅ JWT generated for user:", user._id);

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        avatar: user.avatar,
        googleId: user.googleId,
        loginMethod: user.loginMethod,
        isVerified: user.isVerified,
      },
      message: "Google login successful",
    });
  } catch (error) {
    console.error("❌ Google auth error:", {
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: "Server error during Google authentication",
      error: error.message,
    });
  }
};

// ---------------- LOGOUT ------------------
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

// ---------------- FORGOT PASSWORD ------------------
export const forgotPassword = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    // Skip if Google user
    if (user.loginMethod === "google") {
      return res.status(400).json({
        message: "Google accounts use Google login. Please login with Google.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    await sendEmail({
      email,
      name: user.name || "",
      subject: "Reset Password OTP - Osheen Oracle",
      message: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`,
      templateId: "otp_template_34",
      variables: {
        otp,
        company_name: "Osheen Oracle",
        name: user.name || "User",
      }
    });

    res.json({
      success: true,
      requiresOtp: true,
      message: "Password reset OTP sent to email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- RESET PASSWORD ------------------
export const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const schema = Joi.object({
      password: Joi.string().min(6).required(),
      email: Joi.string().email().optional(),
      otp: Joi.string().optional(),
      otpId: Joi.string().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.loginMethod = "email"; // Support login with the new email/password

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- PROFILE ------------------
export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpire",
    );
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        avatar: user.avatar,
        loginMethod: user.loginMethod,
        isVerified: user.isVerified,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- CREATE FIRST ADMIN (Helper Function) ------------------
export const createFirstAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@osheenoracle.com" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Admin@123456", 10);
      const admin = await User.create({
        name: "Admin User",
        email: "admin@osheenoracle.com",
        password: hashedPassword,
        type: "admin",
        loginMethod: "email",
        isVerified: true,
      });
      console.log("✅ Admin user created successfully!");
      console.log("📧 Email: admin@osheenoracle.com");
      console.log("🔑 Password: Admin@123456");
      return admin;
    } else if (adminExists.type !== "admin") {
      adminExists.type = "admin";
      adminExists.isVerified = true;
      await adminExists.save();
      console.log("✅ Existing user upgraded to admin");
      return adminExists;
    }

    console.log("ℹ️ Admin user already exists");
    return adminExists;
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};

// Add these functions to your authControllers.js file:

// ---------------- UPDATE PROFILE ------------------
export const updateProfile = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
      dateOfBirth: Joi.date().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const updates = req.body;

    // Don't allow updating email for Google users
    if (req.user.loginMethod === "google" && updates.email) {
      delete updates.email;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password -resetPasswordToken -resetPasswordExpire");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        avatar: user.avatar,
        type: user.type,
        loginMethod: user.loginMethod,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- CHANGE PASSWORD ------------------
export const changePassword = async (req, res) => {
  try {
    const schema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password field
    const user = await User.findById(req.user.id);

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login. Cannot change password.",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- UPDATE PROFILE IMAGE ------------------
export const updateProfileImage = async (req, res) => {
  try {
    // Get user ID from logged-in user (not from params)
    const userId = req.user.id || req.user._id;

    console.log("Updating profile image for user:", userId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers.host;

    let subPath = "documents";
    if (req.file.mimetype.startsWith("image/")) {
      subPath = "images";
    } else if (req.file.mimetype.startsWith("video/")) {
      subPath = "videos";
    }

    const imageUrl = `${protocol}://${host}/uploads/${subPath}/${req.file.filename}`;
    console.log("Image URL:", imageUrl);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: imageUrl },
      { new: true },
    ).select("-password -resetPasswordToken -resetPasswordExpire");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile image updated successfully",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        profileImage: imageUrl,
      },
    });
  } catch (error) {
    console.error("Update profile image error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- VERIFY OTP ------------------
export const verifyOtp = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.json({ success: true, verified: true, message: "Email is already verified" });
    }

    if (!user.otp || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      verified: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- RESEND OTP ------------------
export const resendOtp = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      email,
      name: user.name || "",
      subject: "Verify your email - Osheen Oracle",
      message: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
      templateId: "otp_template_34",
      variables: {
        otp,
        company_name: "Osheen Oracle",
        name: user.name || "User",
      }
    });

    res.json({
      success: true,
      message: "Verification OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- VERIFY RESET OTP ------------------
export const verifyResetOtp = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== otp ||
      user.resetPasswordOtpExpire < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Generate temporary token for reset-password
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    // Clear the reset OTP
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      verified: true,
      resetToken,
      message: "Reset OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- RESEND RESET OTP ------------------
export const resendResetOtp = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      email,
      name: user.name || "",
      subject: "Reset Password OTP - Osheen Oracle",
      message: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`,
      templateId: "otp_template_34",
      variables: {
        otp,
        company_name: "Osheen Oracle",
        name: user.name || "User",
      }
    });

    res.json({
      success: true,
      message: "Password reset OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
