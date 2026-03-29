const User = require("../models/User");
const Resume = require("../models/Resume");
const { sendTokens, verifyRefreshToken, generateAccessToken } = require("../utils/jwt");
const { createError } = require("../middleware/errorHandler");
const { successResponse } = require("../utils/apiResponse");

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    return next(createError(409, "An account with this email already exists"));
  }

  // Create user (password hashed by pre-save hook in model)
  const user = await User.create({ name, email, password });

  // Send tokens + user data
  sendTokens(res, user, 201);
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Fetch user with password (select: false by default)
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(createError(401, "Invalid email or password"));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(createError(401, "Invalid email or password"));
  }

  sendTokens(res, user);
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
const logout = async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  // Optionally invalidate refresh token in DB (for extra security)
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  successResponse(res, {}, "Logged out successfully");
};

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
// Called automatically by the frontend apiClient when access token expires
const refresh = async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return next(createError(401, "No refresh token"));
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return next(createError(401, "Invalid or expired refresh token"));
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(createError(401, "User no longer exists"));
  }

  const accessToken = generateAccessToken(user._id);
  res.json({ success: true, accessToken });
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is already set by protect middleware
  successResponse(res, { user: req.user });
};

// ── PATCH /api/auth/update-profile ───────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  const { name, avatar } = req.body;

  const updates = {};
  if (name) updates.name = name.trim();
  if (avatar) updates.avatar = avatar.trim();

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  successResponse(res, { user }, "Profile updated");
};

// ── PATCH /api/auth/change-password ──────────────────────────────────────────
const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(createError(400, "Current password is incorrect"));
  }

  user.password = newPassword;
  await user.save(); // triggers pre-save hash

  successResponse(res, {}, "Password changed successfully");
};

// ── DELETE /api/auth/delete-account ──────────────────────────────────────────
const deleteAccount = async (req, res, next) => {
  const userId = req.user._id;

  // Cascade delete: remove all user's resumes, then the user
  await Resume.deleteMany({ userId });
  await User.findByIdAndDelete(userId);

  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  successResponse(res, {}, "Account deleted successfully");
};

module.exports = { signup, login, logout, refresh, getMe, updateProfile, changePassword, deleteAccount };
