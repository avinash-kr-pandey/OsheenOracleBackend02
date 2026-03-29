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
    if (user) return res.status(400).json({ message: "User already exists" });

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

    user = await User.create({
      name,
      email,
      password: hashed,
      type: userType,
      loginMethod: "email",
      isVerified: isVerified,
    });

    res.json({
      message: "Registration successful",
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

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    await sendEmail(
      email,
      "Reset Password",
      `
      You requested a password reset.
      Click this link to reset your password: ${resetUrl}
      This link expires in 15 minutes.
    `,
    );

    res.json({
      success: true,
      message: "Password reset link sent to email",
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
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

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
