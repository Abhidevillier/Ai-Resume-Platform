const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createError } = require("./errorHandler");

/**
 * Protect routes — verifies access token from Authorization header.
 * Attaches req.user on success.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError(401, "No token provided"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Fetch user (exclude sensitive fields)
    const user = await User.findById(decoded.userId).select("-password -refreshToken");
    if (!user) {
      return next(createError(401, "User no longer exists"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error); // JWT errors handled in errorHandler
  }
};

/**
 * Restrict to pro plan only.
 * Must be used AFTER protect middleware.
 */
const requirePro = (req, res, next) => {
  if (!req.user.isPro()) {
    return next(createError(403, "This feature requires a Pro plan. Please upgrade."));
  }
  next();
};

module.exports = { protect, requirePro };
