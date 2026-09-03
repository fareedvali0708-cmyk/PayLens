const { z } = require("zod");

/**
 * Zod validation schema for user login.
 */
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

/**
 * Zod validation schema for merchant signup.
 */
const signupSchema = z.object({
  businessName: z
    .string({ required_error: "Business name is required" })
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name cannot exceed 100 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password cannot exceed 128 characters"),
});

/**
 * Zod validation schema for merchant settings.
 */
const settingsSchema = z.object({
  business_name: z
    .string({ required_error: "Business name is required" })
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name cannot exceed 100 characters"),
  razorpay_key_id: z
    .string()
    .trim()
    .regex(
      /^rzp_(test|live)_[a-zA-Z0-9]+$/,
      "Razorpay Key ID must start with rzp_test_ or rzp_live_ followed by alphanumeric characters"
    )
    .optional()
    .or(z.literal("").transform(() => null))
    .nullable(),
  razorpay_key_secret: z
    .string()
    .trim()
    .min(8, "Razorpay Key Secret must be at least 8 characters")
    .optional()
    .or(z.literal("").transform(() => null))
    .nullable(),
  razorpay_webhook_secret: z
    .string()
    .trim()
    .min(8, "Webhook Secret must be at least 8 characters")
    .optional()
    .or(z.literal("").transform(() => null))
    .nullable(),
});

module.exports = {
  loginSchema,
  signupSchema,
  settingsSchema,
};
