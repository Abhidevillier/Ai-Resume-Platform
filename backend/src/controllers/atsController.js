const Resume = require("../models/Resume");
const AtsResult = require("../models/AtsResult");
const { scoreResume, resumeToText } = require("../services/atsService");
const { createError } = require("../middleware/errorHandler");
const { successResponse } = require("../utils/apiResponse");

// ── POST /api/ats/analyze ─────────────────────────────────────────────────────
const analyzeResume = async (req, res, next) => {
  const { resumeId, jobDescription, jobTitle = "" } = req.body;

  // Fetch the resume and verify ownership
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) return next(createError(404, "Resume not found"));

  // Run scoring
  const { score, matchedKeywords, missingKeywords } = scoreResume(resume, jobDescription);

  // Build basic suggestions based on score (AI suggestions come in Step 6)
  const suggestions = buildSuggestions(score, missingKeywords, resume);

  // Save result to DB
  const result = await AtsResult.create({
    userId: req.user._id,
    resumeId,
    jobTitle,
    jobDescription,
    score,
    matchedKeywords,
    missingKeywords,
    suggestions,
    resumeSnapshot: resumeToText(resume),
  });

  // Update the resume's lastAtsScore field
  await Resume.findByIdAndUpdate(resumeId, { lastAtsScore: score.overall });

  successResponse(res, { result }, "ATS analysis complete");
};

// ── GET /api/ats/history/:resumeId ────────────────────────────────────────────
const getHistory = async (req, res, next) => {
  const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user._id });
  if (!resume) return next(createError(404, "Resume not found"));

  const results = await AtsResult.find({ resumeId: req.params.resumeId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("-resumeSnapshot -jobDescription");

  successResponse(res, { results });
};

// ── GET /api/ats/result/:id ───────────────────────────────────────────────────
const getResult = async (req, res, next) => {
  const result = await AtsResult.findOne({ _id: req.params.id, userId: req.user._id });
  if (!result) return next(createError(404, "Result not found"));
  successResponse(res, { result });
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const buildSuggestions = (score, missingKeywords, resume) => {
  const suggestions = [];

  if (score.overall < 40) {
    suggestions.push({
      section: "general",
      priority: "high",
      text: `Your resume matches only ${score.overall}% of the job description. Significantly tailor your content to this specific role.`,
    });
  }

  if (score.keywordMatch < 50 && missingKeywords.length > 0) {
    const top5 = missingKeywords.slice(0, 5).join(", ");
    suggestions.push({
      section: "skills",
      priority: "high",
      text: `Add these missing keywords to your skills or experience: ${top5}.`,
    });
  }

  if (score.experienceMatch < 40) {
    suggestions.push({
      section: "experience",
      priority: "high",
      text: "Rewrite your experience bullet points to incorporate more keywords from the job description.",
    });
  }

  if (!resume.personalInfo?.summary) {
    suggestions.push({
      section: "summary",
      priority: "medium",
      text: "Add a professional summary tailored to the job description. ATS systems rank resumes with summaries higher.",
    });
  }

  if ((resume.skills?.technical || []).length < 5) {
    suggestions.push({
      section: "skills",
      priority: "medium",
      text: "Expand your technical skills section. Most ATS systems heavily weight the skills section.",
    });
  }

  if (score.overall >= 80) {
    suggestions.push({
      section: "general",
      priority: "low",
      text: "Great match! Your resume is well-optimized for this role. Focus on making your achievements more quantifiable.",
    });
  }

  return suggestions;
};

module.exports = { analyzeResume, getHistory, getResult };
