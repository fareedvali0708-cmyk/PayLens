require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const settingsRoutes = require("./routes/settings");
const webhookRoutes = require("./routes/webhooks");
const recoveryRoutes = require("./routes/recovery");
const simulatorRoutes = require("./routes/simulator");
const metricsRoutes = require("./routes/metrics");
const checkoutRoutes = require("./routes/checkout");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// ---------------------------------------------------------------------------
// Security Headers via Helmet
// ---------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: false, // APIs return JSON; CSP not needed for headless API
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ---------------------------------------------------------------------------
// Local Development Multiple-Origin CORS Configuration
// ---------------------------------------------------------------------------
const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o && o !== "*");

// Allow multiple local development ports (5173, 5174, 5175) to prevent port collision issues
const allowedOrigins = Array.from(
  new Set([
    ...configuredOrigins,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
  ])
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS policy blocked access: origin '${origin}' is not permitted.`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-razorpay-signature"],
  })
);

// Parse JSON bodies while preserving rawBody for webhook HMAC verification
app.use(
  express.json({
    limit: "1mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Parse URL-encoded bodies (curl default form POSTs)
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/transactions", recoveryRoutes);
app.use("/api/recovery", recoveryRoutes);
app.use("/api/dev", simulatorRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/checkout", checkoutRoutes);

// Catch-all 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ---------------------------------------------------------------------------
// Global Error Handler (must be last)
// ---------------------------------------------------------------------------
app.use(errorHandler);

module.exports = app;
