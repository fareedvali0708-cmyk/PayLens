const express = require("express");
const { z } = require("zod");
const crypto = require("crypto");
const { supabase } = require("../config/supabase");
const {
  FAILURE_SCENARIOS,
  resolveScenario,
  classifyFailure,
} = require("../utils/failureClassifier");
const { enrichTransactionWithAIInsight } = require("../services/geminiService");

const router = express.Router();

// Real merchant ID created in Supabase for testing & simulation
const DEFAULT_MERCHANT_ID =
  process.env.DEFAULT_MERCHANT_ID || "9c985d7f-6e00-4b91-922b-d4570afa712f";

/**
 * Resilient schema that safely coerces and sanitizes developer input.
 */
const simulateSchema = z.object({
  scenario: z
    .preprocess(
      (val) => (typeof val === "string" ? resolveScenario(val) : "BANK_DOWN"),
      z.string().default("BANK_DOWN")
    ),
  merchant_id: z
    .preprocess(
      (val) =>
        typeof val === "string" && val.trim() !== ""
          ? val.trim()
          : DEFAULT_MERCHANT_ID,
      z.string().uuid("Invalid merchant_id format. Must be a valid UUID.").default(DEFAULT_MERCHANT_ID)
    ),
  amount: z
    .preprocess(
      (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : 2499.0),
      z.number().positive("Amount must be a positive number.").default(2499.0)
    ),
  currency: z
    .preprocess(
      (val) => (typeof val === "string" && val.trim() !== "" ? val.trim().toUpperCase() : "INR"),
      z.string().default("INR")
    ),
  customer_email: z
    .preprocess(
      (val) => (typeof val === "string" && val.trim() !== "" ? val.trim() : "customer@example.com"),
      z.string().email("Invalid email format.").default("customer@example.com")
    ),
  customer_phone: z
    .preprocess(
      (val) => (typeof val === "string" && val.trim() !== "" ? val.trim() : "+919876543210"),
      z.string().default("+919876543210")
    ),
  error_code: z
    .preprocess((val) => (typeof val === "string" && val.trim() !== "" ? val.trim() : undefined), z.string().optional()),
  error_description: z
    .preprocess((val) => (typeof val === "string" && val.trim() !== "" ? val.trim() : undefined), z.string().optional()),
  failure_reason: z
    .preprocess((val) => (typeof val === "string" && val.trim() !== "" ? val.trim() : undefined), z.string().optional()),
});

/**
 * POST /api/dev/simulate-failure
 *
 * Developer route: Simulates realistic payment failures, runs the classification engine,
 * and records the event in Supabase failed_transactions associated with the merchant.
 */
router.post("/simulate-failure", async (req, res, next) => {
  try {
    // Ensure req.body is an object even if empty or sent with non-JSON headers
    const rawBody = req.body && typeof req.body === "object" ? req.body : {};
    const data = simulateSchema.parse(rawBody);

    const scenarioKey = data.scenario;
    const isCustom = scenarioKey === "CUSTOM";
    const preset = FAILURE_SCENARIOS[scenarioKey] || FAILURE_SCENARIOS.BANK_DOWN;

    const errorCode = data.error_code || (isCustom ? "BAD_REQUEST_ERROR" : preset.errorCode);
    const errorDescription =
      data.error_description || (isCustom ? "Simulated payment failure" : preset.errorDescription);
    const failureReason =
      data.failure_reason || (isCustom ? "custom_simulation" : preset.failureReason);

    // 1. Classify the failure
    const classification = classifyFailure({
      errorCode,
      errorDescription,
      failureReason,
    });

    // 2. Generate simulated Razorpay IDs
    const randomHex = crypto.randomBytes(4).toString("hex");
    const simulatedPaymentId = `pay_sim_${Date.now()}_${randomHex}`;
    const simulatedOrderId = `order_sim_${Date.now()}_${randomHex}`;

    // 3. Resolve merchant ID (uses passed merchant_id or defaults to 9c985d7f-6e00-4b91-922b-d4570afa712f)
    let merchantId = data.merchant_id || DEFAULT_MERCHANT_ID;
    let merchantName = "Merchant";

    // Lookup merchant details if available
    const { data: merchantData, error: mErr } = await supabase
      .from("merchants")
      .select("id, business_name")
      .eq("id", merchantId)
      .maybeSingle();

    if (merchantData) {
      merchantName = merchantData.business_name || merchantName;
    } else if (mErr) {
      console.warn(`[Simulator] Warning querying merchant ${merchantId}:`, mErr.message);
    }

    // 4. Insert into Supabase failed_transactions with initial null ai_insight
    const { data: insertedTransaction, error: insertError } = await supabase
      .from("failed_transactions")
      .insert({
        merchant_id: merchantId,
        razorpay_payment_id: simulatedPaymentId,
        razorpay_order_id: simulatedOrderId,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        amount: data.amount,
        currency: data.currency,
        error_code: errorCode,
        error_description: errorDescription,
        failure_reason: classification.category,
        ai_insight: null,
        status: "PENDING",
        recovery_attempts: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Simulator DB Insert Error]", insertError);
      return res.status(500).json({
        error: "Database Insert Error",
        message: "Failed to persist simulated transaction to Supabase.",
        merchant_id_used: merchantId,
        details: insertError.message,
        hint: insertError.hint || "Ensure table permissions are granted: GRANT ALL ON TABLE failed_transactions TO service_role;",
        classification,
      });
    }

    // 5. Non-blocking: fetch Gemini insight asynchronously in background and update record
    enrichTransactionWithAIInsight(insertedTransaction.id, {
      failureReason: classification.category,
      errorDescription,
      errorCode,
      amount: data.amount,
      currency: data.currency,
    });

    return res.status(201).json({
      success: true,
      message: `Simulated failure scenario '${scenarioKey}' created successfully. AI insight is processing in background.`,
      scenario: scenarioKey,
      merchant: {
        id: merchantId,
        business_name: merchantName,
      },
      classification,
      transaction: insertedTransaction,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
