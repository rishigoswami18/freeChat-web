import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Verify User Middleware
 * Blocks access to 'Live Predictions' if the user is not verified.
 * Ensures the platform maintains a 'High-Trust' environment.
 */
export const isVerified = (req, res, next) => {
    if (req.user && req.user.isVerified) {
        next();
    } else {
        res.status(403).json({ 
            message: "Action Required! You must be a 'Verified Fan' to access Live Predictions. 🥉🛡️",
            action: "/kyc"
        });
    }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admin only" });
  }
};