const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { analyzeResume, getHistory, getResult } = require("../controllers/atsController");

const router = express.Router();

// 30 analyses per 10 minutes per user — prevents abuse
const atsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { success: false, message: "Too many ATS requests. Please wait 10 minutes." },
});

router.use(protect);

router.post(
  "/analyze",
  atsLimiter,
  [
    body("resumeId").notEmpty().withMessage("Resume ID is required"),
    body("jobDescription")
      .notEmpty().withMessage("Job description is required")
      .isLength({ min: 50 }).withMessage("Job description must be at least 50 characters"),
  ],
  validate,
  analyzeResume
);

router.get("/history/:resumeId", getHistory);
router.get("/result/:id", getResult);

module.exports = router;
