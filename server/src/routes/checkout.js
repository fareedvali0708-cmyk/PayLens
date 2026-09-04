const express = require("express");
const Razorpay = require("razorpay");
const { z } = require("zod");
const { supabase } = require("../config/supabase");

const router = express.Router();

const DEFAULT_MERCHANT_ID =
  process.env.DEFAULT_MERCHANT_ID || "9c985d7f-6e00-4b91-922b-d4570afa712f";

const createOrderSchema = z.object({
  amount: z
    .preprocess(
      (val) => (val !== undefined && val !== null && val !== "" ? Number(val) : 1499),
      z.number().positive("Amount must be a positive number.").default(1499)
    ),
  currency: z
    .preprocess(
      (val) => (typeof val === "string" && val.trim() !== "" ? val.trim().toUpperCase() : "INR"),
      z.string().default("INR")
    ),
  merchant_id: z.string().uuid().optional(),
});

/**
 * Helper to get Razorpay instance for a merchant.
 * Checks merchant credentials in DB first, then falls back to environment variables.
 */
async function getRazorpayCredentials(merchantId) {
  let keyId = process.env.RAZORPAY_KEY_ID;
  let keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (merchantId) {
    const { data: merchant } = await supabase
      .from("merchants")
      .select("razorpay_key_id, razorpay_key_secret")
      .eq("id", merchantId)
      .maybeSingle();

    if (merchant?.razorpay_key_id && merchant?.razorpay_key_secret) {
      keyId = merchant.razorpay_key_id;
      keySecret = merchant.razorpay_key_secret;
    }
  }

  if (!keyId || !keySecret || keyId.includes("placeholder")) {
    return { client: null, keyId: null };
  }

  return {
    client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
    keyId,
  };
}

/**
 * POST /api/checkout/create-order
 *
 * Minimal customer checkout order creation endpoint.
 * Creates a Razorpay Test Mode order and returns only the public metadata needed by Checkout.js.
 */
router.post("/create-order", async (req, res, next) => {
  try {
    const parseResult = createOrderSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: parseResult.error.issues[0]?.message || "Invalid order parameters.",
      });
    }

    const { amount, currency } = parseResult.data;

    // Resolve merchant identity:
    // 1. Authenticated session via Bearer token takes absolute precedence.
    // 2. Client is not permitted to arbitrarily choose or override merchant_id.
    // 3. Fall back to DEFAULT_MERCHANT_ID only for genuinely unauthenticated/dev flows.
    let merchant_id = DEFAULT_MERCHANT_ID;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser(token);
          if (user?.id && !authError) {
            merchant_id = user.id;
          }
        } catch (authErr) {
          console.error("[Checkout Auth Error]", authErr);
        }
      }
    }
    const { client: razorpay, keyId } = await getRazorpayCredentials(merchant_id);

    if (!razorpay || !keyId) {
      return res.status(503).json({
        error: "Gateway Unavailable",
        message: "Razorpay Test Mode credentials are not configured.",
      });
    }

    // Convert to paise (e.g. 1499 INR -> 149900 paise)
    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `chk_${Date.now().toString(36)}`,
      notes: {
        merchant_id,
        source: "paylens_test_checkout",
      },
    });

    // Return ONLY the public information required by the frontend Checkout.js
    return res.status(201).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (err) {
    console.error("[Checkout Create Order Error]", err);
    return res.status(500).json({
      error: "Order Creation Failed",
      message: err.message || "Failed to create Razorpay checkout order.",
    });
  }
});

module.exports = router;
