const mongoose = require("mongoose");

const atsResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
    },
    // Score breakdown
    score: {
      overall: { type: Number, required: true, min: 0, max: 100 },
      keywordMatch: { type: Number, min: 0, max: 100 },
      skillsMatch: { type: Number, min: 0, max: 100 },
      experienceMatch: { type: Number, min: 0, max: 100 },
    },
    // Keyword analysis
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    // AI-generated suggestions
    suggestions: [
      {
        section: {
          type: String,
          enum: ["summary", "experience", "skills", "education", "general"],
        },
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium",
        },
        text: { type: String, required: true },
      },
    ],
    // Raw snapshot of resume text used for this analysis
    resumeSnapshot: {
      type: String,
      select: false, // exclude from default queries to save bandwidth
    },
  },
  {
    timestamps: true,
  }
);

// Keep only last 10 ATS results per resume to avoid bloat
atsResultSchema.index({ resumeId: 1, createdAt: -1 });

module.exports = mongoose.model("AtsResult", atsResultSchema);
