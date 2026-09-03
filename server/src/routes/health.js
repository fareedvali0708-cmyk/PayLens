const express = require("express");
const router = express.Router();

/**
 * GET /api/health
 * Lightweight liveness check — no auth required.
 */
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "paylens-api",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
