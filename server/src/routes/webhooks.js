const express = require("express");
const crypto = require("crypto");
const { supabase } = require("../config/supabase");
const { classifyFailure } = require("../utils/failureClassifier");
const { enrichTransactionWithAIInsight } = require("../services/geminiService");

const router = express.Router();

/**
 * Validates Razorpay Webhook HMAC SHA256 signature.
 *
 * @param {string|Buffer} rawBody
 * @param {string} signature
 * @param {string} secret
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  try {
    const payload =
      Buffer.isBuffer(rawBody)
        ? rawBody
        : typeof rawBody === "string"
          ? rawBody
          : JSON.stringify(rawBody);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch (err) {
    console.error("[Webhook Signature Error]", err);
    return false;
  }
}

/**
 * POST /api/webhooks/razorpay
 *
 * Ingests and processes Razorpay webhook notifications.
 * Listens primarily for:
 *   - 'payment.failed': records failed transaction with classification
 *   - 'payment_link.paid' / 'payment.captured': marks recovered transactions as RECOVERED
 */
router.post("/razorpay", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Validate signature if secret is configured
    if (webhookSecret && signature) {
      const rawPayload = req.rawBody || req.body;
      const isValid = verifyWebhookSignature(rawPayload, signature, webhookSecret);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    } else if (webhookSecret && !signature) {
      return res.status(400).json({ error: "Missing x-razorpay-signature header" });
    }

    const payload = req.body;
    const eventType = payload.event;

    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    if (eventType === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      if (!paymentEntity) {
        return res.status(400).json({ error: "Malformed payload: missing payment entity" });
      }

      // Convert amount in paise to standard currency units (e.g. 199900 paise -> 1999.00)
      const rawAmount = paymentEntity.amount;
      const parsedAmount = typeof rawAmount === "number" ? rawAmount / 100 : Number(rawAmount) || 0;

      // Extract error details
      const errorCode = paymentEntity.error_code || "BAD_REQUEST_ERROR";
      const errorDescription = paymentEntity.error_description || "Payment failed";
      const failureReason = paymentEntity.error_reason || paymentEntity.error_source || "";

      // Classify the failure
      const classification = classifyFailure({
        errorCode,
        errorDescription,
        failureReason,
      });

      // Resolve merchant
      let merchantId = paymentEntity.notes?.merchant_id;
      if (!merchantId) {
        // Fallback: look up first registered merchant in database or use default
        const { data: merchants, error: merchantErr } = await supabase
          .from("merchants")
          .select("id")
          .limit(1);

        if (!merchantErr && merchants && merchants.length > 0) {
          merchantId = merchants[0].id;
        } else {
          merchantId =
            process.env.DEFAULT_MERCHANT_ID || "9c985d7f-6e00-4b91-922b-d4570afa712f";
        }
      }

      if (!merchantId) {
        return res.status(422).json({
          error: "No merchant found to associate with failed payment",
        });
      }

      // Insert failed transaction into Supabase with initial null ai_insight
      const { data: insertedTransaction, error: insertError } = await supabase
        .from("failed_transactions")
        .insert({
          merchant_id: merchantId,
          razorpay_payment_id: paymentEntity.id || null,
          razorpay_order_id: paymentEntity.order_id || null,
          customer_email: paymentEntity.email || null,
          customer_phone: paymentEntity.contact || null,
          amount: parsedAmount,
          currency: paymentEntity.currency || "INR",
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
        console.error("[Webhook DB Error] Failed inserting transaction:", insertError);
        return res.status(500).json({ error: "Failed to persist failed transaction", details: insertError.message });
      }

      // Non-blocking: fetch Gemini insight asynchronously in background and update record
      enrichTransactionWithAIInsight(insertedTransaction.id, {
        failureReason: classification.category,
        errorDescription,
        errorCode,
        amount: parsedAmount,
        currency: paymentEntity.currency || "INR",
      });

      return res.status(200).json({
        success: true,
        event: eventType,
        message: "Payment failure recorded successfully (AI insight processing asynchronously)",
        transactionId: insertedTransaction.id,
        classification,
      });
    }

    // Handle successful recovery event via payment link
    if (eventType === "payment_link.paid" || eventType === "payment.captured") {
      const paymentLinkEntity = payload.payload?.payment_link?.entity;
      const paymentEntity = payload.payload?.payment?.entity;
      const paymentLinkId = paymentLinkEntity?.id || null;
      const originalTxId =
        paymentLinkEntity?.notes?.original_transaction_id ||
        paymentEntity?.notes?.original_transaction_id ||
        null;

      if (paymentLinkId || originalTxId) {
        // Update recovery logs
        if (paymentLinkId) {
          await supabase
            .from("recovery_logs")
            .update({ status: "PAID" })
            .eq("payment_link_id", paymentLinkId);
        }

        // Update failed transaction status to RECOVERED if a target transaction ID is resolved
        let targetTxId = originalTxId || null;
        if (!targetTxId && paymentLinkId) {
          // Find transaction_id from recovery_logs
          const { data: logData } = await supabase
            .from("recovery_logs")
            .select("transaction_id")
            .eq("payment_link_id", paymentLinkId)
            .maybeSingle();

          if (logData?.transaction_id) {
            targetTxId = logData.transaction_id;
          }
        }

        if (targetTxId) {
          await supabase
            .from("failed_transactions")
            .update({ status: "RECOVERED" })
            .eq("id", targetTxId);
        }
      }

      return res.status(200).json({
        success: true,
        event: eventType,
        message: "Payment recovery recorded successfully",
      });
    }

    // Acknowledge other unhandled webhook events gracefully
    return res.status(200).json({
      success: true,
      event: eventType,
      message: "Webhook event received and ignored (not a failure or recovery event)",
    });
  } catch (err) {
    console.error("[Razorpay Webhook Uncaught Error]", err);
    return res.status(500).json({ error: "Internal webhook processing error" });
  }
});

module.exports = router;
