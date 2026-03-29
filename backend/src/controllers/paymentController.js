const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { createError } = require("../middleware/errorHandler");
const { successResponse } = require("../utils/apiResponse");

// Plan config — single source of truth
const PLANS = {
  pro_monthly: {
    amount: parseInt(process.env.PRO_MONTHLY_PRICE) || 49900, // ₹499
    durationDays: 30,
    label: "Pro Monthly",
  },
  pro_annual: {
    amount: parseInt(process.env.PRO_ANNUAL_PRICE) || 399900, // ₹3999
    durationDays: 365,
    label: "Pro Annual",
  },
};

// ── POST /api/payment/create-order ────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  const { planId } = req.body;

  const plan = PLANS[planId];
  if (!plan) return next(createError(400, "Invalid plan selected"));

  // Create Razorpay order
  let order;
  try {
    order = await razorpay.orders.create({
      amount: plan.amount,
      currency: "INR",
      receipt: `rcpt_${req.user._id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
      notes: { userId: req.user._id.toString(), planId },
    });
  } catch (rzpError) {
    // Razorpay errors have a nested structure — surface a clean message
    const description = rzpError?.error?.description || "";
    if (description.toLowerCase().includes("authentication")) {
      return next(createError(500, "Payment gateway not configured. Please add valid Razorpay API keys."));
    }
    return next(createError(502, `Payment gateway error: ${description || "Please try again."}`));
  }

  // Persist the order
  await Payment.create({
    userId: req.user._id,
    razorpayOrderId: order.id,
    plan: planId,
    amount: plan.amount,
    currency: "INR",
    status: "created",
  });

  successResponse(res, {
    orderId: order.id,
    amount: plan.amount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    planLabel: plan.label,
  });
};

// ── POST /api/payment/verify ──────────────────────────────────────────────────
// Called by the frontend after Razorpay checkout completes
const verifyPayment = async (req, res, next) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = req.body;

  // 1. Verify HMAC signature — prevents forged payment confirmations
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return next(createError(400, "Payment verification failed. Invalid signature."));
  }

  // 2. Find the payment record
  const payment = await Payment.findOne({
    razorpayOrderId,
    userId: req.user._id,
  });
  if (!payment) return next(createError(404, "Payment record not found"));
  if (payment.status === "paid") {
    return successResponse(res, {}, "Payment already processed");
  }

  // 3. Calculate plan expiry
  const plan = PLANS[planId || payment.plan];
  const planValidUntil = new Date();
  planValidUntil.setDate(planValidUntil.getDate() + plan.durationDays);

  // 4. Update payment record
  await Payment.findByIdAndUpdate(payment._id, {
    razorpayPaymentId,
    razorpaySignature,
    status: "paid",
    planValidUntil,
    verifiedAt: new Date(),
  });

  // 5. Upgrade user plan
  await User.findByIdAndUpdate(req.user._id, {
    plan: "pro",
    planExpiresAt: planValidUntil,
  });

  successResponse(res, { planValidUntil }, "Payment verified! Your Pro plan is now active.");
};

// ── POST /api/payment/webhook ─────────────────────────────────────────────────
// Razorpay webhook — handles async payment events (backup to verify endpoint)
const webhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Verify webhook signature if secret is configured
  if (webhookSecret) {
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSig !== signature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }
  }

  const { event, payload } = req.body;

  if (event === "payment.captured") {
    const { order_id, id: paymentId } = payload.payment.entity;

    const payment = await Payment.findOne({ razorpayOrderId: order_id });
    if (payment && payment.status !== "paid") {
      const plan = PLANS[payment.plan];
      const planValidUntil = new Date();
      planValidUntil.setDate(planValidUntil.getDate() + plan.durationDays);

      await Payment.findByIdAndUpdate(payment._id, {
        razorpayPaymentId: paymentId,
        status: "paid",
        planValidUntil,
        verifiedAt: new Date(),
      });

      await User.findByIdAndUpdate(payment.userId, {
        plan: "pro",
        planExpiresAt: planValidUntil,
      });
    }
  }

  if (event === "payment.failed") {
    const { order_id } = payload.payment.entity;
    await Payment.findOneAndUpdate({ razorpayOrderId: order_id }, { status: "failed" });
  }

  res.json({ received: true });
};

// ── GET /api/payment/history ──────────────────────────────────────────────────
const getHistory = async (req, res) => {
  const payments = await Payment.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select("-razorpaySignature -__v")
    .limit(20);

  successResponse(res, { payments });
};

// ── GET /api/payment/status ───────────────────────────────────────────────────
const getPlanStatus = async (req, res) => {
  const user = await User.findById(req.user._id);
  successResponse(res, {
    plan: user.plan,
    planExpiresAt: user.planExpiresAt,
    isPro: user.isPro(),
  });
};

module.exports = { createOrder, verifyPayment, webhook, getHistory, getPlanStatus };
