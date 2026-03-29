const Resume = require("../models/Resume");
const User = require("../models/User");
const { createError } = require("../middleware/errorHandler");
const { successResponse } = require("../utils/apiResponse");

// ── GET /api/resumes — list all resumes for current user ──────────────────────
const getResumes = async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id })
    .sort({ updatedAt: -1 })
    .select("-__v");
  successResponse(res, { resumes });
};

// ── GET /api/resumes/:id ───────────────────────────────────────────────────────
const getResume = async (req, res, next) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) return next(createError(404, "Resume not found"));
  successResponse(res, { resume });
};

// ── POST /api/resumes ─────────────────────────────────────────────────────────
const createResume = async (req, res, next) => {
  // Enforce plan restriction
  if (!req.user.canCreateResume()) {
    return next(
      createError(403, "Free plan allows only 1 resume. Upgrade to Pro to create unlimited resumes.")
    );
  }

  const resume = await Resume.create({ ...req.body, userId: req.user._id });

  // Increment user resume count
  await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: 1 } });

  successResponse(res, { resume }, "Resume created", 201);
};

// ── PUT /api/resumes/:id ──────────────────────────────────────────────────────
const updateResume = async (req, res, next) => {
  const resume = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { ...req.body, userId: req.user._id }, // prevent userId override
    { new: true, runValidators: true }
  );
  if (!resume) return next(createError(404, "Resume not found"));
  successResponse(res, { resume }, "Resume updated");
};

// ── DELETE /api/resumes/:id ───────────────────────────────────────────────────
const deleteResume = async (req, res, next) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!resume) return next(createError(404, "Resume not found"));

  // Decrement user resume count (floor at 0)
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { resumeCount: -1 },
  });

  successResponse(res, {}, "Resume deleted");
};

// ── POST /api/resumes/:id/duplicate ──────────────────────────────────────────
const duplicateResume = async (req, res, next) => {
  if (!req.user.canCreateResume()) {
    return next(
      createError(403, "Free plan allows only 1 resume. Upgrade to Pro to create unlimited resumes.")
    );
  }

  const original = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!original) return next(createError(404, "Resume not found"));

  // Clone without _id, userId, timestamps so Mongoose generates fresh ones
  const { _id, userId, createdAt, updatedAt, __v, ...cloneData } = original.toObject();
  const copy = await Resume.create({
    ...cloneData,
    userId: req.user._id,
    title: `${original.title} (Copy)`,
    lastAtsScore: null,
    aiImproved: false,
  });

  await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: 1 } });

  successResponse(res, { resume: copy }, "Resume duplicated", 201);
};

module.exports = { getResumes, getResume, createResume, updateResume, deleteResume, duplicateResume };
