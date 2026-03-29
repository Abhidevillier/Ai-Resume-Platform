const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");

const {
  signup,
  login,
  logout,
  refresh,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

// Stricter rate limit for auth routes — prevents brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Validation chains ─────────────────────────────────────────────────────────

const signupValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Must contain at least one number"),
];

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/signup", authLimiter, signupValidation, validate, signup);
router.post("/login",  authLimiter, loginValidation,  validate, login);
router.post("/logout", logout);
router.post("/refresh", refresh);

// ── Protected routes ──────────────────────────────────────────────────────────
router.get("/me",              protect, getMe);
router.patch("/update-profile", protect, updateProfile);
router.patch("/change-password", protect, changePasswordValidation, validate, changePassword);
router.delete("/delete-account", protect, deleteAccount);

module.exports = router;
