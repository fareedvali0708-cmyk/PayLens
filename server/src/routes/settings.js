const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { settingsSchema } = require("../schemas/authSchemas");

const router = express.Router();

/**
 * GET /api/settings
 *
 * Retrieves merchant profile and Razorpay credentials for the authenticated user.
 */
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { data: merchant, error } = await req.supabase
      .from("merchants")
      .select("id, business_name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, created_at")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: "Database Error",
        message: "Failed to fetch merchant settings.",
        details: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      settings: merchant || {
        id: req.user.id,
        business_name: "",
        razorpay_key_id: "",
        razorpay_key_secret: "",
        razorpay_webhook_secret: "",
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/settings
 *
 * Validates and updates merchant profile and Razorpay credentials.
 */
router.put("/", authMiddleware, async (req, res, next) => {
  try {
    const parseResult = settingsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: parseResult.error.issues[0]?.message || "Invalid settings data.",
        issues: parseResult.error.issues,
      });
    }

    const { business_name, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret } = parseResult.data;

    const { data: updated, error } = await req.supabase
      .from("merchants")
      .upsert({
        id: req.user.id,
        business_name,
        razorpay_key_id,
        razorpay_key_secret,
        razorpay_webhook_secret,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: "Database Error",
        message: "Failed to update merchant settings.",
        details: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      settings: updated,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
