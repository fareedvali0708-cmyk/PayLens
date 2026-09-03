const express = require("express");
const { supabase } = require("../config/supabase");
const { loginRateLimiter } = require("../middleware/rateLimiter");
const { loginSchema, signupSchema } = require("../schemas/authSchemas");

const router = express.Router();

/**
 * POST /api/auth/login
 *
 * Authenticates a merchant with email & password.
 * Rate-limited to max 5 attempts per 15 minutes per IP to mitigate brute-force attacks.
 * Validates request payload against loginSchema (Zod).
 */
router.post("/login", loginRateLimiter, async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: parseResult.error.issues[0]?.message || "Invalid login input.",
        issues: parseResult.error.issues,
      });
    }

    const { email, password } = parseResult.data;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session) {
      return res.status(401).json({
        error: "Authentication Failed",
        message: error?.message || "Invalid email or password.",
      });
    }

    return res.status(200).json({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/signup
 *
 * Registers a new merchant account in Supabase Auth and seeds a merchant record.
 * Validates request payload against signupSchema (Zod).
 */
router.post("/signup", async (req, res, next) => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: parseResult.error.issues[0]?.message || "Invalid registration input.",
        issues: parseResult.error.issues,
      });
    }

    const { businessName, email, password } = parseResult.data;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        error: "Registration Failed",
        message: error.message || "Failed to create account.",
      });
    }

    // Seed the merchant profile record
    if (data?.user) {
      const { error: merchantError } = await supabase
        .from("merchants")
        .upsert({
          id: data.user.id,
          business_name: businessName,
        });

      if (merchantError) {
        console.warn("[Auth Signup] Notice: Merchant record creation:", merchantError.message);
      }
    }

    return res.status(200).json({
      success: true,
      user: data.user,
      session: data.session,
      requiresEmailConfirmation: !data.session,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
