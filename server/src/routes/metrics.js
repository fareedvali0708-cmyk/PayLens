const express = require("express");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/metrics
 *
 * Retrieves recovery analytics and KPI metrics for the authenticated merchant:
 * - Total failed payments and gross lost value
 * - Total recovered payments and recovered revenue
 * - Recovery rate percentage
 * - Breakdown by failure category / error code
 * - Breakdown by status (PENDING, RECOVERY_SENT, RECOVERED, etc.)
 * - Recent failed transaction timeline
 */
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const merchantId = req.user.id;

    // Fetch all transactions for this merchant using req.supabase (RLS enforced)
    const { data: transactions, error } = await req.supabase
      .from("failed_transactions")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Metrics Error] Failed querying transactions:", error);
      return res.status(500).json({
        error: "Database Error",
        message: "Failed to retrieve transaction metrics.",
        details: error.message,
      });
    }

    const txList = transactions || [];

    // 1. Calculate Aggregate Totals
    let totalFailedCount = txList.length;
    let totalFailedAmount = 0;
    let totalRecoveredCount = 0;
    let totalRecoveredAmount = 0;
    let pendingCount = 0;
    let recoverySentCount = 0;

    const categoryBreakdown = {};
    const statusBreakdown = {
      PENDING: 0,
      RECOVERY_SENT: 0,
      RECOVERED: 0,
      FAILED: 0,
    };

    txList.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      totalFailedAmount += amount;

      // Status counters
      const status = (tx.status || "PENDING").toUpperCase();
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

      if (status === "RECOVERED") {
        totalRecoveredCount += 1;
        totalRecoveredAmount += amount;
      } else if (status === "RECOVERY_SENT") {
        recoverySentCount += 1;
      } else if (status === "PENDING") {
        pendingCount += 1;
      }

      // Category breakdown
      const category = tx.failure_reason || tx.error_code || "UNKNOWN";
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          category,
          count: 0,
          total_amount: 0,
          recovered_count: 0,
        };
      }
      categoryBreakdown[category].count += 1;
      categoryBreakdown[category].total_amount += amount;
      if (status === "RECOVERED") {
        categoryBreakdown[category].recovered_count += 1;
      }
    });

    const recoveryRate =
      totalFailedCount > 0
        ? Number(((totalRecoveredCount / totalFailedCount) * 100).toFixed(2))
        : 0;

    const metrics = {
      summary: {
        total_failed_count: totalFailedCount,
        total_failed_amount: Number(totalFailedAmount.toFixed(2)),
        total_recovered_count: totalRecoveredCount,
        total_recovered_amount: Number(totalRecoveredAmount.toFixed(2)),
        recovery_rate_percentage: recoveryRate,
        pending_count: pendingCount,
        recovery_sent_count: recoverySentCount,
        currency: txList[0]?.currency || "INR",
      },
      status_breakdown: statusBreakdown,
      category_breakdown: Object.values(categoryBreakdown).sort(
        (a, b) => b.count - a.count
      ),
      recent_failures: txList.slice(0, 10),
    };

    return res.status(200).json({
      success: true,
      metrics,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
