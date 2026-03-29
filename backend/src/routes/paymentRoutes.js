const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createOrder,
  verifyPayment,
  webhook,
  getHistory,
  getPlanStatus,
} = require("../controllers/paymentController");

const router = express.Router();

// Webhook does NOT need auth — Razorpay calls it directly
// Must be registered BEFORE express.json() would parse the body
// (body parsing is already done in server.js, webhook signature uses raw body)
router.post("/webhook", webhook);

// All other payment routes require authentication
router.use(protect);

router.post(
  "/create-order",
  [body("planId").isIn(["pro_monthly", "pro_annual"]).withMessage("Invalid plan")],
  validate,
  createOrder
);

router.post(
  "/verify",
  [
    body("razorpayOrderId").notEmpty().withMessage("Order ID required"),
    body("razorpayPaymentId").notEmpty().withMessage("Payment ID required"),
    body("razorpaySignature").notEmpty().withMessage("Signature required"),
  ],
  validate,
  verifyPayment
);

router.get("/history", getHistory);
router.get("/status",  getPlanStatus);

module.exports = router;
