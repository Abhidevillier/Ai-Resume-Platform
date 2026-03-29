const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
} = require("../controllers/resumeController");

const router = express.Router();

// All resume routes require authentication
router.use(protect);

const resumeTitleValidation = [
  body("title").optional().trim().isLength({ max: 100 }).withMessage("Title max 100 chars"),
  body("personalInfo.name").notEmpty().withMessage("Name is required"),
  body("personalInfo.email").isEmail().withMessage("Valid email required"),
];

router.get("/",    getResumes);
router.get("/:id", getResume);
router.post("/",   resumeTitleValidation, validate, createResume);
router.put("/:id", resumeTitleValidation, validate, updateResume);
router.delete("/:id", deleteResume);
router.post("/:id/duplicate", duplicateResume);

module.exports = router;
