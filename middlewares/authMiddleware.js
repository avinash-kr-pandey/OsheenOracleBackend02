import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // 1. Check if token exists
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired, please login again",
        });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
      throw error;
    }

    // 3. Check if user still exists in database
    const user = await User.findById(decoded.id).select(
      "-password -resetPasswordToken -resetPasswordExpire",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // 4. Check if user is verified (for email users) - Skip for admin
    if (
      user.loginMethod === "email" &&
      !user.isVerified &&
      user.type !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // 5. Attach user to request object (complete user object)
    req.user = {
      id: user._id,
      _id: user._id, // Added for consistency
      email: user.email,
      name: user.name,
      type: user.type, // 'user' or 'admin'
      loginMethod: user.loginMethod,
      isVerified: user.isVerified,
      phone: user.phone,
      avatar: user.avatar,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

// Admin middleware - checks if user is admin
export const admin = (req, res, next) => {
  if (req.user && req.user.type === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};

// Role-based middleware
export const authorize = (...types) => {
  return (req, res, next) => {
    if (!types.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        message: `User type ${req.user.type} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Optional auth (for routes that work with/without auth)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "-password -resetPasswordToken -resetPasswordExpire",
      );
      if (user) {
        req.user = {
          id: user._id,
          _id: user._id,
          email: user.email,
          name: user.name,
          type: user.type,
          loginMethod: user.loginMethod,
          phone: user.phone,
        };
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// NEW: Check if user owns the resource (for service requests)
export const checkOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      // If admin, always allow
      if (req.user.type === "admin") {
        return next();
      }

      const resourceUserId = await getResourceUserId(req);

      if (!resourceUserId) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      if (resourceUserId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access this resource",
        });
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      res.status(500).json({
        success: false,
        message: "Error checking ownership",
      });
    }
  };
};
