require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { supabase } = require("../config/supabase");

// Fallback coaching tips catalog by failure category
const FALLBACK_TIPS = {
  BANK_DOWNTIME:
    "The issuing bank is experiencing temporary downtime or network latency. Send an omni-channel recovery link with UPI and credit card options to rescue the sale without waiting.",
  AUTHENTICATION_FAILED:
    "Customer authentication timed out or failed 3D-Secure verification. Dispatch an immediate 1-click WhatsApp/Email recovery link while customer purchase intent is highest.",
  INSUFFICIENT_FUNDS:
    "The customer's primary account balance was insufficient for this amount. Provide a recovery payment link offering split payments, credit cards, or BNPL alternatives.",
  LIMIT_EXCEEDED:
    "Transaction exceeded the customer's daily card or bank limits. Offer netbanking or alternate corporate card options via a direct payment link.",
  INSTRUMENT_INVALID:
    "The card used has expired or is disabled for online e-commerce. Prompt the customer with a recovery link to update their card or switch to instant UPI.",
  UPI_ERROR:
    "UPI collect request timed out or was rejected in the customer's UPI app. Send an instant UPI Intent link for frictionless 1-tap payment.",
  CUSTOMER_DROPOFF:
    "Customer abandoned the checkout before completing verification. Trigger an automated recovery message within 15 minutes to re-engage them.",
  GATEWAY_ERROR:
    "A temporary gateway network timeout interrupted the transaction. Automatically retry the payment or send a recovery link for instant reprocessing.",
  FRAUD_SECURITY:
    "Payment was declined by fraud prevention security rules. Manually review customer risk profile before attempting manual recovery.",
  DEFAULT:
    "Payment could not be processed with the chosen payment method. Send an omni-channel recovery link to allow the customer to complete their order using an alternate method.",
};

/**
 * Gets a safe fallback coaching tip based on failure reason / category
 */
function getFallbackTip(failureReason = "") {
  const normalized = String(failureReason).toUpperCase();
  for (const [key, tip] of Object.entries(FALLBACK_TIPS)) {
    if (normalized.includes(key)) return tip;
  }
  return FALLBACK_TIPS.DEFAULT;
}

/**
 * Generates an actionable 2-sentence merchant coaching tip using Gemini AI.
 * Includes automatic timeout and graceful fallback.
 *
 * @param {Object} params
 * @param {string} params.failureReason
 * @param {string} params.errorDescription
 * @param {string} [params.errorCode]
 * @param {number} [params.amount]
 * @param {string} [params.currency]
 * @returns {Promise<string>}
 */
async function generateCoachingTip({
  failureReason = "UNKNOWN",
  errorDescription = "Payment failed",
  errorCode = "BAD_REQUEST_ERROR",
  amount = 0,
  currency = "INR",
} = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes("placeholder") || apiKey.includes("your-")) {
    console.log("[Gemini AI] No valid API key provided. Using categorized fallback insight.");
    return getFallbackTip(failureReason);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert payment optimization assistant for merchants on Razorpay.
Analyze this payment failure and provide EXACTLY a short, highly actionable 2-sentence coaching tip for the merchant.
Do not use bullet points or introductions. Return only the 2 sentences advising what the merchant or customer should do to recover the payment and prevent lost revenue.

Payment Details:
- Failure Reason / Category: ${failureReason}
- Error Description: ${errorDescription}
- Error Code: ${errorCode}
- Amount: ${amount} ${currency}`;

    // Execute with a 10-second timeout promise race
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini AI request timed out")), 10000)
    );

    const generatePromise = ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const generatedText = response?.text?.trim();

    if (generatedText && generatedText.length > 10) {
      return generatedText;
    }

    return getFallbackTip(failureReason);
  } catch (err) {
    console.warn(`[Gemini AI] Failed generating insight (${err.message}). Using fallback tip.`);
    return getFallbackTip(failureReason);
  }
}

/**
 * Non-blocking background worker that generates a Gemini AI insight
 * and updates the failed_transactions record in Supabase.
 *
 * @param {string} transactionId - UUID of the failed transaction
 * @param {Object} context - Metadata for generating the insight
 */
async function enrichTransactionWithAIInsight(transactionId, context) {
  if (!transactionId) return;

  // Run asynchronously in the background
  setImmediate(async () => {
    try {
      console.log(`[AI Insight Worker] Generating Gemini insight for transaction ${transactionId}...`);
      const insight = await generateCoachingTip(context);

      const { error } = await supabase
        .from("failed_transactions")
        .update({ ai_insight: insight })
        .eq("id", transactionId);

      if (error) {
        console.error(`[AI Insight Worker] Failed updating transaction ${transactionId}:`, error.message);
      } else {
        console.log(`[AI Insight Worker] ✓ Successfully attached AI insight to transaction ${transactionId}`);
      }
    } catch (err) {
      console.error(`[AI Insight Worker] Uncaught error for transaction ${transactionId}:`, err.message);
    }
  });
}

module.exports = {
  generateCoachingTip,
  enrichTransactionWithAIInsight,
  getFallbackTip,
};
