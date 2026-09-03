const express = require("express");
const Razorpay = require("razorpay");
const { z } = require("zod");
const { authMiddleware } = require("../middleware/auth");
const { supabase } = require("../config/supabase");

const router = express.Router();

/**
 * GET /api/transactions
 *
 * Returns all failed_transactions for the authenticated merchant.
 * Supports optional query parameters:
 *   ?status=PENDING|RECOVERY_SENT|RECOVERED|FAILED
 *   ?search=<customer_email or order_id substring>
 */
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    let query = req.supabase
      .from("failed_transactions")
      .select("*")
      .eq("merchant_id", req.user.id)
      .order("created_at", { ascending: false });

    // Optional status filter
    const { status, search } = req.query;
    if (status && ["PENDING", "RECOVERY_SENT", "RECOVERED", "FAILED", "IGNORED"].includes(status.toUpperCase())) {
      query = query.eq("status", status.toUpperCase());
    }

    // Optional search filter (customer email or order ID)
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`customer_email.ilike.${term},razorpay_order_id.ilike.${term}`);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error("[Transactions List Error]", error);
      return res.status(500).json({
        error: "Database Error",
        message: "Failed to retrieve transactions.",
        details: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      transactions: transactions || [],
      count: (transactions || []).length,
    });
  } catch (err) {
    next(err);
  }
});

const recoverParamsSchema = z.object({
  id: z.string().uuid("Invalid transaction ID format (must be a valid UUID)"),
});

const recoverBodySchema = z
  .object({
    customMessage: z.string().optional(),
    expiryMinutes: z.number().int().positive().optional().default(1440), // 24 hours default
  })
  .optional();

/**
 * Helper to get Razorpay instance for a merchant.
 * Checks merchant record in database first, then falls back to environment variables.
 */
async function getRazorpayClient(merchantId) {
  // Check merchant credentials in DB
  const { data: merchant } = await supabase
    .from("merchants")
    .select("razorpay_key_id, razorpay_key_secret")
    .eq("id", merchantId)
    .single();

  const keyId = merchant?.razorpay_key_id || process.env.RAZORPAY_KEY_ID;
  const keySecret = merchant?.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret && !keyId.includes("placeholder") && !keyId.includes("your-")) {
    return {
      client: new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      }),
      isLive: true,
    };
  }

  return { client: null, isLive: false };
}

/**
 * POST /api/transactions/:id/recover
 *
 * Initiates payment recovery for a failed transaction.
 * 1. Checks that the transaction belongs to the authenticated merchant
 * 2. Creates a Razorpay Payment Link (or sandbox simulation)
 * 3. Records link generation in `recovery_logs`
 * 4. Updates `failed_transactions` status and recovery attempt metrics
 */
async function handleRecover(req, res, next) {
  try {
    const params = recoverParamsSchema.parse(req.params);
    const body = recoverBodySchema.parse(req.body) || {};

    const transactionId = params.id;
    const merchantId = req.user.id;

    // Fetch failed transaction ensuring merchant ownership via req.supabase (RLS)
    const { data: transaction, error: txError } = await req.supabase
      .from("failed_transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (txError || !transaction) {
      return res.status(404).json({
        error: "Transaction not found",
        message: "No failed transaction matching this ID was found for your merchant account.",
      });
    }

    if (transaction.status === "RECOVERED") {
      return res.status(400).json({
        error: "Already Recovered",
        message: "This transaction has already been successfully recovered.",
      });
    }

    const { client: razorpay, isLive } = await getRazorpayClient(merchantId);

    let paymentLinkId;
    let paymentLinkUrl;
    let paymentLinkStatus = "created";

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(transaction.amount) * 100);
    const expireBy = Math.floor(Date.now() / 1000) + (body.expiryMinutes || 1440) * 60;

    if (isLive && razorpay) {
      // Create live Razorpay Payment Link
      const paymentLinkPayload = {
        amount: amountInPaise,
        currency: transaction.currency || "INR",
        accept_partial: false,
        description: body.customMessage || `Payment Recovery for Order ${transaction.razorpay_order_id || transaction.id.slice(0, 8)}`,
        customer: {
          name: "Valued Customer",
          email: transaction.customer_email || undefined,
          contact: transaction.customer_phone || undefined,
        },
        notify: {
          sms: !!transaction.customer_phone,
          email: !!transaction.customer_email,
        },
        reminder_enable: true,
        expire_by: expireBy,
        notes: {
          original_transaction_id: transaction.id,
          merchant_id: merchantId,
          recovery_source: "paylens_engine",
        },
      };

      const liveLink = await razorpay.paymentLink.create(paymentLinkPayload);
      paymentLinkId = liveLink.id;
      paymentLinkUrl = liveLink.short_url || liveLink.url;
      paymentLinkStatus = liveLink.status || "created";
    } else {
      // Dev / Sandbox simulated payment link
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      paymentLinkId = `plink_sim_${Date.now()}_${randomSuffix}`;
      paymentLinkUrl = `https://rzp.io/i/sim_${randomSuffix}`;
    }

    // 1. Insert into recovery_logs
    const { data: recoveryLog, error: logError } = await req.supabase
      .from("recovery_logs")
      .insert({
        transaction_id: transaction.id,
        payment_link_id: paymentLinkId,
        payment_link_url: paymentLinkUrl,
        status: paymentLinkStatus.toUpperCase(),
      })
      .select()
      .single();

    if (logError) {
      console.error("[Recovery Error] Failed writing recovery log:", logError);
      return res.status(500).json({
        error: "Database Error",
        message: "Failed to record recovery log.",
        details: logError.message,
      });
    }

    // 2. Update failed_transactions recovery count & status
    const newAttempts = (transaction.recovery_attempts || 0) + 1;
    const { data: updatedTransaction, error: updateError } = await req.supabase
      .from("failed_transactions")
      .update({
        recovery_attempts: newAttempts,
        last_recovery_at: new Date().toISOString(),
        status: "RECOVERY_SENT",
      })
      .eq("id", transaction.id)
      .select()
      .single();

    if (updateError) {
      console.error("[Recovery Error] Failed updating transaction:", updateError);
    }

    return res.status(200).json({
      success: true,
      message: "Recovery payment link generated successfully",
      recovery: {
        id: recoveryLog.id,
        payment_link_id: paymentLinkId,
        payment_link_url: paymentLinkUrl,
        status: paymentLinkStatus.toUpperCase(),
        attempts: newAttempts,
        is_live_mode: isLive,
      },
      transaction: updatedTransaction || transaction,
    });
  } catch (err) {
    next(err);
  }
}

router.post("/:id/recover", authMiddleware, handleRecover);
router.post("/:id", authMiddleware, handleRecover);

module.exports = router;
