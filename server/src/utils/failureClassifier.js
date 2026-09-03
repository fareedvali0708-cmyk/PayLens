/**
 * PayLens Failure Classifier Utility
 *
 * Inspects payment failure error codes, descriptions, and gateway response reasons
 * to produce actionable diagnostic categories, recovery recommendations, and human-readable insights.
 */

/**
 * Standard failure categories supported by the engine
 */
const FailureCategory = {
  BANK_DOWNTIME: "BANK_DOWNTIME",
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  LIMIT_EXCEEDED: "LIMIT_EXCEEDED",
  INSTRUMENT_INVALID: "INSTRUMENT_INVALID",
  UPI_ERROR: "UPI_ERROR",
  CUSTOMER_DROPOFF: "CUSTOMER_DROPOFF",
  GATEWAY_ERROR: "GATEWAY_ERROR",
  FRAUD_SECURITY: "FRAUD_SECURITY",
  UNKNOWN: "UNKNOWN",
};

/**
 * Pre-defined scenario catalog for simulation and matching
 */
const FAILURE_SCENARIOS = {
  BANK_DOWN: {
    errorCode: "GATEWAY_ERROR",
    errorDescription: "Issuing bank server is currently unavailable or experiencing high latency.",
    failureReason: "bank_unavailable",
    category: FailureCategory.BANK_DOWNTIME,
    severity: "HIGH",
    isRecoverable: true,
    recommendedAction: "Send recovery payment link offering alternate banks or UPI payment options after a 5-minute cooldown.",
    userFriendlyMessage: "Payment failed due to temporary bank downtime. Alternate payment methods (UPI/Credit Card) recommended.",
  },
  INSUFFICIENT_FUNDS: {
    errorCode: "BAD_REQUEST_ERROR",
    errorDescription: "The account does not have sufficient funds to complete this transaction.",
    failureReason: "payment_failed_insufficient_funds",
    category: FailureCategory.INSUFFICIENT_FUNDS,
    severity: "MEDIUM",
    isRecoverable: true,
    recommendedAction: "Send payment link immediately allowing payment via alternative credit card, BNPL, or another bank account.",
    userFriendlyMessage: "Insufficient balance on the selected payment method. Recovery link with multiple payment alternatives sent.",
  },
  OTP_TIMEOUT: {
    errorCode: "BAD_REQUEST_ERROR",
    errorDescription: "Customer did not submit the 3D-Secure OTP within the allowed time limit.",
    failureReason: "payment_authentication_timed_out",
    category: FailureCategory.AUTHENTICATION_FAILED,
    severity: "LOW",
    isRecoverable: true,
    recommendedAction: "Send an instant 1-click recovery link directly to WhatsApp/Email with pre-filled cart details.",
    userFriendlyMessage: "Authentication timed out. High conversion chance on immediate retry.",
  },
  OTP_INCORRECT: {
    errorCode: "BAD_REQUEST_ERROR",
    errorDescription: "Customer entered an invalid OTP during 3D-Secure authentication.",
    failureReason: "payment_otp_incorrect",
    category: FailureCategory.AUTHENTICATION_FAILED,
    severity: "LOW",
    isRecoverable: true,
    recommendedAction: "Send an instant retry link with prompt to verify OTP.",
    userFriendlyMessage: "Incorrect OTP entered during verification. Quick retry recommended.",
  },
  CARD_EXPIRED: {
    errorCode: "BAD_REQUEST_ERROR",
    errorDescription: "Card has expired or expiry date entered is invalid.",
    failureReason: "payment_card_expired",
    category: FailureCategory.INSTRUMENT_INVALID,
    severity: "MEDIUM",
    isRecoverable: true,
    recommendedAction: "Send payment link asking customer to pay using a valid card, UPI, or Netbanking.",
    userFriendlyMessage: "The card used has expired. Customer must supply an updated payment method.",
  },
  UPI_COLLECT_EXPIRED: {
    errorCode: "BAD_REQUEST_ERROR",
    errorDescription: "UPI Collect authorization request expired before customer approved it on UPI app.",
    failureReason: "upi_collect_request_expired",
    category: FailureCategory.UPI_ERROR,
    severity: "LOW",
    isRecoverable: true,
    recommendedAction: "Send payment link with UPI Intent (Google Pay, PhonePe, Paytm) for instant 1-tap approval.",
    userFriendlyMessage: "UPI collect request timed out. Retrying with UPI Intent link converts 2x better.",
  },
  LIMIT_EXCEEDED: {
    errorCode: "BAD_REQUEST_ERROR",
    errorDescription: "Transaction exceeds customer's daily limit or card online payment limit.",
    failureReason: "payment_limit_exceeded",
    category: FailureCategory.LIMIT_EXCEEDED,
    severity: "MEDIUM",
    isRecoverable: true,
    recommendedAction: "Offer split payment or send payment link to complete via netbanking or corporate card.",
    userFriendlyMessage: "Card or bank limit exceeded. Try alternative payment options via recovery link.",
  },
  GATEWAY_TIMEOUT: {
    errorCode: "GATEWAY_ERROR",
    errorDescription: "Gateway network request timed out while communicating with acquiring network.",
    failureReason: "gateway_timed_out",
    category: FailureCategory.GATEWAY_ERROR,
    severity: "HIGH",
    isRecoverable: true,
    recommendedAction: "Retry transaction automatically via alternate gateway route or send recovery link.",
    userFriendlyMessage: "Temporary payment gateway network glitch. Immediate retry usually succeeds.",
  },
  FRAUD_BLOCKED: {
    errorCode: "BAD_REQUEST_ERROR",
    errorDescription: "Payment was declined by fraud prevention risk rules.",
    failureReason: "risk_threshold_exceeded",
    category: FailureCategory.FRAUD_SECURITY,
    severity: "HIGH",
    isRecoverable: false,
    recommendedAction: "Manual review required. Do not automatically trigger retry links.",
    userFriendlyMessage: "Payment flagged by security rules. Manual merchant review recommended.",
  },
};

/**
 * Scenario aliases mapping for user input flexibility
 */
const SCENARIO_ALIASES = {
  BANK_DOWNTIME: "BANK_DOWN",
  BANK_DOWN: "BANK_DOWN",
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  LOW_BALANCE: "INSUFFICIENT_FUNDS",
  OTP_TIMEOUT: "OTP_TIMEOUT",
  OTP_EXPIRED: "OTP_TIMEOUT",
  OTP_INCORRECT: "OTP_INCORRECT",
  AUTH_FAILED: "OTP_INCORRECT",
  CARD_EXPIRED: "CARD_EXPIRED",
  EXPIRED_CARD: "CARD_EXPIRED",
  UPI_COLLECT_EXPIRED: "UPI_COLLECT_EXPIRED",
  UPI_TIMEOUT: "UPI_COLLECT_EXPIRED",
  LIMIT_EXCEEDED: "LIMIT_EXCEEDED",
  GATEWAY_TIMEOUT: "GATEWAY_TIMEOUT",
  GATEWAY_ERROR: "GATEWAY_TIMEOUT",
  FRAUD_BLOCKED: "FRAUD_BLOCKED",
  FRAUD: "FRAUD_BLOCKED",
};

/**
 * Resolves a scenario name from various user formats (lowercase, hyphens, aliases)
 */
function resolveScenario(input) {
  if (!input || typeof input !== "string") return "BANK_DOWN";
  const normalized = input.trim().toUpperCase().replace(/[-\s]/g, "_");
  if (FAILURE_SCENARIOS[normalized]) return normalized;
  if (SCENARIO_ALIASES[normalized]) return SCENARIO_ALIASES[normalized];
  return "CUSTOM";
}

/**
 * Analyzes payment error metadata and returns a structured failure classification.
 *
 * @param {Object} input
 * @param {string} [input.errorCode]
 * @param {string} [input.errorDescription]
 * @param {string} [input.failureReason]
 * @returns {Object} Structured classification result
 */
function classifyFailure(input = {}) {
  const { errorCode = "", errorDescription = "", failureReason = "" } = input || {};
  const code = String(errorCode || "").toUpperCase();
  const desc = String(errorDescription || "").toLowerCase();
  const reason = String(failureReason || "").toLowerCase();
  const combined = `${code} ${desc} ${reason}`;

  // 1. Check for Fraud / Risk flags
  if (
    combined.includes("fraud") ||
    combined.includes("risk_threshold") ||
    combined.includes("blacklisted") ||
    combined.includes("security_violation")
  ) {
    return {
      category: FailureCategory.FRAUD_SECURITY,
      severity: "HIGH",
      isRecoverable: false,
      recommendedAction: "Hold order for merchant fraud review. Do not auto-recover.",
      userFriendlyMessage: "Payment stopped by risk rules. High risk of fraud.",
      summary: "Security / Risk Rule Violation — Not recommended for automated recovery",
    };
  }

  // 2. Check for Bank Downtime / Network Timeout
  if (
    combined.includes("bank_unavailable") ||
    combined.includes("bank down") ||
    combined.includes("issuer_down") ||
    combined.includes("bank_declined_server") ||
    combined.includes("issuer unavailable") ||
    (code === "GATEWAY_ERROR" && combined.includes("timed_out"))
  ) {
    return {
      category: FailureCategory.BANK_DOWNTIME,
      severity: "HIGH",
      isRecoverable: true,
      recommendedAction: "Trigger recovery payment link with multi-bank & UPI options after 5 minutes.",
      userFriendlyMessage: "Issuing bank server temporarily down. High recovery success via alternative bank/UPI.",
      summary: "Issuing Bank Downtime — Alternate payment method recommended",
    };
  }

  // 3. Check for OTP / Authentication Failures
  if (
    combined.includes("otp") ||
    combined.includes("3d_secure") ||
    combined.includes("authentication") ||
    combined.includes("auth_failed") ||
    combined.includes("incorrect_pin")
  ) {
    const isTimeout = combined.includes("timed_out") || combined.includes("timeout") || combined.includes("expired");
    return {
      category: FailureCategory.AUTHENTICATION_FAILED,
      severity: "LOW",
      isRecoverable: true,
      recommendedAction: "Send 1-click WhatsApp/Email recovery link immediately while intent is high.",
      userFriendlyMessage: isTimeout
        ? "Customer authentication timed out during OTP entry."
        : "Customer entered an incorrect OTP / PIN during authentication.",
      summary: isTimeout
        ? "3DS OTP Timeout — Quick recovery link recommended"
        : "3DS Auth Failure — Incorrect credentials entered",
    };
  }

  // 4. Check for Insufficient Balance
  if (
    combined.includes("insufficient") ||
    combined.includes("low_balance") ||
    combined.includes("not enough funds") ||
    combined.includes("insufficient_funds")
  ) {
    return {
      category: FailureCategory.INSUFFICIENT_FUNDS,
      severity: "MEDIUM",
      isRecoverable: true,
      recommendedAction: "Send recovery link offering Credit Card, PayLater/BNPL, or secondary UPI account.",
      userFriendlyMessage: "Account has insufficient balance for the transaction amount.",
      summary: "Insufficient Funds — Alternative payment option link recommended",
    };
  }

  // 5. Check for Limit Exceeded
  if (
    combined.includes("limit_exceeded") ||
    combined.includes("transaction_limit") ||
    combined.includes("daily_limit") ||
    combined.includes("amount limit")
  ) {
    return {
      category: FailureCategory.LIMIT_EXCEEDED,
      severity: "MEDIUM",
      isRecoverable: true,
      recommendedAction: "Send link allowing alternative payment method with higher limit or netbanking.",
      userFriendlyMessage: "Customer exceeded card or account daily transaction limits.",
      summary: "Transaction Limit Exceeded — Switch to netbanking or corporate card",
    };
  }

  // 6. Check for Invalid Instrument / Expired Card
  if (
    combined.includes("card_expired") ||
    combined.includes("invalid_cvv") ||
    combined.includes("invalid_card") ||
    combined.includes("card_disabled") ||
    combined.includes("card not supported")
  ) {
    return {
      category: FailureCategory.INSTRUMENT_INVALID,
      severity: "MEDIUM",
      isRecoverable: true,
      recommendedAction: "Send payment link requesting valid card details or UPI.",
      userFriendlyMessage: "Card is expired, disabled for online transactions, or invalid.",
      summary: "Invalid Payment Instrument — Prompt for active payment method",
    };
  }

  // 7. Check for UPI-specific errors
  if (
    combined.includes("upi") ||
    combined.includes("vpa") ||
    combined.includes("mpin") ||
    combined.includes("collect_expired")
  ) {
    return {
      category: FailureCategory.UPI_ERROR,
      severity: "LOW",
      isRecoverable: true,
      recommendedAction: "Send dynamic UPI Intent link (GPay / PhonePe / Paytm / Cred).",
      userFriendlyMessage: "UPI approval request expired or failed in the customer's UPI app.",
      summary: "UPI Flow Incomplete — Instant UPI Intent recovery recommended",
    };
  }

  // 8. Check for Customer Dropoff
  if (
    combined.includes("customer_dropped_off") ||
    combined.includes("cancelled_by_user") ||
    combined.includes("user_cancelled") ||
    combined.includes("back_button_pressed")
  ) {
    return {
      category: FailureCategory.CUSTOMER_DROPOFF,
      severity: "LOW",
      isRecoverable: true,
      recommendedAction: "Send automated cart recovery message with instant payment link within 15 minutes.",
      userFriendlyMessage: "Customer abandoned payment on the checkout screen.",
      summary: "Customer Abandonment — Immediate recovery notification recommended",
    };
  }

  // 9. Generic Gateway Error
  if (code.includes("GATEWAY") || code.includes("SERVER")) {
    return {
      category: FailureCategory.GATEWAY_ERROR,
      severity: "HIGH",
      isRecoverable: true,
      recommendedAction: "Send retry payment link to customer.",
      userFriendlyMessage: "Transient gateway error occurred during processing.",
      summary: "Transient Gateway Glitch — High retry recovery rate",
    };
  }

  // 10. Fallback Unknown
  return {
    category: FailureCategory.UNKNOWN,
    severity: "MEDIUM",
    isRecoverable: true,
    recommendedAction: "Send omni-channel recovery link allowing any valid payment instrument.",
    userFriendlyMessage: desc || "Payment could not be processed. Alternate payment recommended.",
    summary: `Payment Failure (${desc || code || "Unspecified"}) — Standard recovery suggested`,
  };
}

module.exports = {
  FailureCategory,
  FAILURE_SCENARIOS,
  SCENARIO_ALIASES,
  resolveScenario,
  classifyFailure,
};
