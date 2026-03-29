const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { protect, requirePro } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  improveBulletsHandler,
  improveAllBulletsHandler,
  generateSummaryHandler,
  suggestSkillsHandler,
  enhanceAtsHandler,
  applyBulletsHandler,
  applySummaryHandler,
} = require("../controllers/aiController");

const router = express.Router();

// AI calls cost money — tighter rate limit: 20 req / 10 min per user
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { success: false, message: "Too many AI requests. Please wait 10 minutes." },
});

// All AI routes: authenticated + Pro plan + rate limited
router.use(protect);
router.use(requirePro);
router.use(aiLimiter);

const resumeIdValidation = [
  body("resumeId").notEmpty().withMessage("Resume ID is required"),
];

const jdValidation = [
  body("jobDescription").notEmpty().withMessage("Job description is required"),
];

// ── Generation endpoints ──────────────────────────────────────────────────────
router.post(
  "/improve-bullets",
  [...resumeIdValidation, body("experienceIndex").isInt({ min: 0 }).withMessage("Valid experience index required")],
  validate,
  improveBulletsHandler
);

router.post(
  "/improve-all-bullets",
  resumeIdValidation,
  validate,
  improveAllBulletsHandler
);

router.post(
  "/generate-summary",
  resumeIdValidation,
  validate,
  generateSummaryHandler
);

router.post(
  "/suggest-skills",
  [...resumeIdValidation, ...jdValidation],
  validate,
  suggestSkillsHandler
);

router.post(
  "/enhance-ats",
  [
    ...resumeIdValidation,
    body("atsResultId").notEmpty().withMessage("ATS result ID is required"),
  ],
  validate,
  enhanceAtsHandler
);

// ── Apply endpoints (save AI output to resume) ────────────────────────────────
router.post("/apply-bullets",  [...resumeIdValidation, body("bullets").isArray()], validate, applyBulletsHandler);
router.post("/apply-summary",  [...resumeIdValidation, body("summary").notEmpty()], validate, applySummaryHandler);

module.exports = router;
