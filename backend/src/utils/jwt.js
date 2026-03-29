const jwt = require("jsonwebtoken");

/**
 * Generate a short-lived access token (15 min default)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

/**
 * Generate a long-lived refresh token (7 days default)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};

/**
 * Verify a refresh token
 * Returns decoded payload or throws
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Send tokens as httpOnly cookie (refresh) + JSON body (access)
 */
const sendTokens = (res, user, statusCode = 200) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Refresh token in httpOnly cookie — prevents XSS access
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  return res.status(statusCode).json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      resumeCount: user.resumeCount,
      avatar: user.avatar,
    },
  });
};

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken, sendTokens };
