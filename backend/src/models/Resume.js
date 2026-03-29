const mongoose = require("mongoose");

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const contactSchema = new mongoose.Schema(
  {
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    github: { type: String, trim: true, default: "" },
    portfolio: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    field: { type: String, trim: true, default: "" },
    startDate: { type: String, default: "" }, // "Aug 2020"
    endDate: { type: String, default: "" },   // "May 2024" | "Present"
    grade: { type: String, default: "" },     // "3.8 GPA" | "85%"
    description: { type: String, default: "" },
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" }, // "Present" if current
    isCurrent: { type: Boolean, default: false },
    bullets: [{ type: String, trim: true }], // achievement bullet points
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    techStack: [{ type: String, trim: true }],
    liveUrl: { type: String, trim: true, default: "" },
    githubUrl: { type: String, trim: true, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
  },
  { _id: true }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, trim: true, default: "" },
    date: { type: String, default: "" },
    url: { type: String, trim: true, default: "" },
  },
  { _id: true }
);

// ── Main Resume Schema ─────────────────────────────────────────────────────────

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "My Resume",
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    // Personal Info
    personalInfo: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      summary: { type: String, default: "" }, // professional summary
      contact: { type: contactSchema, default: () => ({}) },
    },
    // Sections
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    skills: {
      technical: [{ type: String, trim: true }],
      soft: [{ type: String, trim: true }],
      languages: [{ type: String, trim: true }],
    },
    certifications: { type: [certificationSchema], default: [] },
    // Meta
    template: {
      type: String,
      enum: ["modern", "classic", "minimal", "bold"],
      default: "modern",
    },
    isPublic: { type: Boolean, default: false },
    lastAtsScore: { type: Number, default: null, min: 0, max: 100 },
    aiImproved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for fast user resume lookups
resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Resume", resumeSchema);
