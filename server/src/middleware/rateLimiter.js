const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for login endpoint.
 * Restricts to a maximum of 5 attempts per 15 minutes per IP address
 * to protect against brute-force credential stuffing attacks.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  standardHeaders: true, // Return standard RateLimit-* headers (RFC 6585)
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    res.status(429).json({
      error: "Too Many Requests",
      message: "Too many login attempts from this IP. Please try again after 15 minutes.",
      retryAfterMinutes: 15,
    });
  },
});

module.exports = { loginRateLimiter };
