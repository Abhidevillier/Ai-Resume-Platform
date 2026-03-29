const Resume = require("../models/Resume");
const AtsResult = require("../models/AtsResult");
const {
  improveBullets,
  generateSummary,
  suggestSkills,
  enhanceAtsSuggestions,
  rewriteExperience,
} = require("../services/aiService");
const { createError } = require("../middleware/errorHandler");
const { successResponse } = require("../utils/apiResponse");

// ── POST /api/ai/improve-bullets ──────────────────────────────────────────────
// Rewrites bullet points for a specific experience entry
const improveBulletsHandler = async (req, res, next) => {
  const { resumeId, experienceIndex, jobDescription = "", jobTitle = "" } = req.body;

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) return next(createError(404, "Resume not found"));

  const experience = resume.experience[experienceIndex];
  if (!experience) return next(createError(400, "Experience entry not found"));

  const bullets = (experience.bullets || []).filter(Boolean);
  if (bullets.length === 0) return next(createError(400, "No bullets to improve"));

  const improved = await improveBullets(bullets, jobTitle || experience.position, jobDescription);

  successResponse(res, {
    original: bullets,
    improved,
    experienceIndex,
  });
};

// ── POST /api/ai/improve-all-bullets ─────────────────────────────────────────
// Rewrites ALL experience entries at once
const improveAllBulletsHandler = async (req, res, next) => {
  const { resumeId, jobDescription = "", jobTitle = "" } = req.body;

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) return next(createError(404, "Resume not found"));

  if (!resume.experience?.length) {
    return next(createError(400, "No experience entries found"));
  }

  // Process each experience entry (sequential to avoid rate limits)
  const results = [];
  for (const [i, exp] of resume.experience.entries()) {
    const bullets = (exp.bullets || []).filter(Boolean);
    if (bullets.length === 0) {
      results.push({ experienceIndex: i, original: [], improved: [] });
      continue;
    }
    const improved = await improveBullets(bullets, jobTitle || exp.position, jobDescription);
    results.push({ experienceIndex: i, original: bullets, improved });
  }

  successResponse(res, { results });
};

// ── POST /api/ai/generate-summary ─────────────────────────────────────────────
const generateSummaryHandler = async (req, res, next) => {
  const { resumeId, jobTitle = "", jobDescription = "" } = req.body;

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) return next(createError(404, "Resume not found"));

  const summary = await generateSummary(resume.toObject(), jobTitle, jobDescription);
  const original = resume.personalInfo?.summary || "";

  successResponse(res, { original, improved: summary });
};

// ── POST /api/ai/suggest-skills ───────────────────────────────────────────────
const suggestSkillsHandler = async (req, res, next) => {
  const { resumeId, jobDescription, jobTitle = "" } = req.body;

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) return next(createError(404, "Resume not found"));

  const suggestions = await suggestSkills(resume.skills?.toObject?.() || resume.skills, jobDescription, jobTitle);

  successResponse(res, { suggestions, currentSkills: resume.skills });
};

// ── POST /api/ai/enhance-ats ──────────────────────────────────────────────────
// Enhances ATS result with AI-powered deep suggestions
const enhanceAtsHandler = async (req, res, next) => {
  const { atsResultId, resumeId } = req.body;

  const [atsResult, resume] = await Promise.all([
    AtsResult.findOne({ _id: atsResultId, userId: req.user._id }),
    Resume.findOne({ _id: resumeId, userId: req.user._id }),
  ]);

  if (!atsResult) return next(createError(404, "ATS result not found"));
  if (!resume)    return next(createError(404, "Resume not found"));

  const enhanced = await enhanceAtsSuggestions(atsResult.toObject(), resume.toObject());

  // Merge AI suggestions into the ATS result
  await AtsResult.findByIdAndUpdate(atsResultId, { suggestions: enhanced });

  successResponse(res, { suggestions: enhanced });
};

// ── POST /api/ai/apply-bullets ────────────────────────────────────────────────
// Saves AI-improved bullets back to the resume
const applyBulletsHandler = async (req, res, next) => {
  const { resumeId, experienceIndex, bullets } = req.body;

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) return next(createError(404, "Resume not found"));
  if (!resume.experience[experienceIndex]) return next(createError(400, "Experience not found"));

  resume.experience[experienceIndex].bullets = bullets;
  resume.aiImproved = true;
  await resume.save();

  successResponse(res, { resume }, "Bullets applied to resume");
};

// ── POST /api/ai/apply-summary ────────────────────────────────────────────────
const applySummaryHandler = async (req, res, next) => {
  const { resumeId, summary } = req.body;

  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) return next(createError(404, "Resume not found"));

  resume.personalInfo.summary = summary;
  resume.aiImproved = true;
  await resume.save();

  successResponse(res, { resume }, "Summary applied to resume");
};

module.exports = {
  improveBulletsHandler,
  improveAllBulletsHandler,
  generateSummaryHandler,
  suggestSkillsHandler,
  enhanceAtsHandler,
  applyBulletsHandler,
  applySummaryHandler,
};
