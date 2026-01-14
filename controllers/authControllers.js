import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.js";
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
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { name, email, password, type } = req.body;

    // Prevent assigning admin role during public registration
    // if (type === "admin") return res.status(403).json({ message: "Cannot assign admin role" });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email,
      password: hashed,
      type: type || undefined,
    });

    res.json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
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

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Login or register with Google
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Token missing" 
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

    // ✅ USE YOUR MODEL'S findOrCreate METHOD
    let user = await User.findOrCreate({
      email,
      name,
      picture,
      googleId,
    });

    // Generate JWT
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    console.log("✅ JWT generated for user:", user._id);

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        _id: user._id,
        id: user._id, // ✅ Virtual field
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
      error: error.message
    });
  }
};
// ---------------- LOGOUT ------------------

export const logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
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

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

    await sendEmail(email, "Reset Password", `Reset using: ${resetUrl}`);

    res.json({ message: "Password reset link sent to email" });
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

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const schema = Joi.object({
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------- PROTECTED SAMPLE ROUTE ---------

export const profile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};
