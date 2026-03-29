require("dotenv").config();
require("express-async-errors"); // patches async route handlers — no try/catch needed

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// ── Route imports (added as we build each feature) ────────────────────────────
const authRoutes    = require("./routes/authRoutes");
const resumeRoutes  = require("./routes/resumeRoutes");
const atsRoutes     = require("./routes/atsRoutes");
const aiRoutes      = require("./routes/aiRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet()); // sets secure HTTP headers

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // allow cookies (refresh token)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Global rate limiter — 100 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", globalLimiter);

// ── General middleware ────────────────────────────────────────────────────────
app.use(express.json({ limit: "5mb" }));        // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(cookieParser());                          // parse cookies

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // HTTP request logger
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/ats",     atsRoutes);
app.use("/api/ai",      aiRoutes);
app.use("/api/payment", paymentRoutes);

// ── Error handling (must be last) ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
