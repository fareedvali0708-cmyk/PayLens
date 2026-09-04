/**
 * Regression tests for the Razorpay webhook endpoint (webhooks.js):
 *   1. HMAC signature verification is computed over the exact raw request
 *      body bytes (req.rawBody Buffer from express.json), never over
 *      JSON.stringify(Buffer).
 *   2. NO code path in the recovery branch may issue an unscoped
 *      PATCH .../failed_transactions        (no ?id=eq.<transaction> filter)
 *
 * Strategy: boot the real Express app and the real supabase-js client, but
 * intercept the transport (global.fetch for /rest/v1/*) so every PostgREST
 * request is captured and asserted on. Nothing leaves this machine and no
 * database is touched.
 *
 * RAZORPAY_WEBHOOK_SECRET is pinned to a known test value for the duration of
 * the run so signature verification is exercised deterministically.
 */
require("dotenv").config();

const assert = require("node:assert");
const crypto = require("node:crypto");
const { once } = require("node:events");

const TEST_SECRET = "paylens-test-webhook-secret-2026";
const previousSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
process.env.RAZORPAY_WEBHOOK_SECRET = TEST_SECRET;
const WEBHOOK_SECRET = TEST_SECRET;

const realFetch = global.fetch;
const restCalls = [];
const allCalls = [];

// Intercept only Supabase (PostgREST) traffic; pass everything else through.
global.fetch = async (url, options = {}) => {
  const u = String(url);
  if (u.includes("/rest/v1/")) {
    const call = { method: options.method || "GET", url: u };
    restCalls.push(call);
    allCalls.push(call);
    // recovery_logs fallback: expose ONE log row for the "legacy" link so the
    // recovery_logs -> transaction_id mapping path can be exercised.
    const json =
      u.includes("/recovery_logs") && u.includes("payment_link_id=eq.plink_legacy")
        ? [{ transaction_id: LEGACY_TX }]
        : [];
    const body = JSON.stringify(json);
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      json: async () => json,
      text: async () => body, // postgrest-js reads res.text() first
    };
  }
  return realFetch(url, options);
};

const app = require("./src/app");

// Transaction referenced directly in a PayLens-created payment link's notes.
const PAYLENS_TX = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
// Transaction reachable only through the recovery_logs mapping.
const LEGACY_TX = "11111111-2222-4333-8444-555555555555";

let server;
let base;
let passed = 0;

async function startServer() {
  server = app.listen(0);
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
}

async function stopServer() {
  try {
    server.closeAllConnections?.();
  } catch {
    /* ignore */
  }
  await new Promise((resolve) => server.close(resolve));
}

function hmacHex(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * POST a webhook payload.
 * @param {object} payload
 * @param {"valid"|"invalid"|"old-bug"|"none"} signatureMode
 *   valid    - HMAC over the exact raw body text (as Razorpay sends)
 *   invalid  - arbitrary wrong signature
 *   old-bug  - HMAC over JSON.stringify(Buffer.from(body)): the previous
 *              defective transformation, which must now be REJECTED
 *   none     - no x-razorpay-signature header
 */
async function postWebhook(payload, signatureMode = "valid") {
  const body = JSON.stringify(payload);
  const headers = { "content-type": "application/json" };
  if (signatureMode === "valid") headers["x-razorpay-signature"] = hmacHex(body, WEBHOOK_SECRET);
  else if (signatureMode === "invalid") headers["x-razorpay-signature"] = "0".repeat(64);
  else if (signatureMode === "old-bug") {
    headers["x-razorpay-signature"] = hmacHex(JSON.stringify(Buffer.from(body)), WEBHOOK_SECRET);
  }
  // signatureMode "none": leave the header off.

  const res = await realFetch(`${base}/api/webhooks/razorpay`, {
    method: "POST",
    headers,
    body,
  });
  return { status: res.status, json: await res.json() };
}

const failedPatches = () =>
  restCalls.filter((c) => c.method === "PATCH" && c.url.includes("/failed_transactions"));
const logPatches = () =>
  restCalls.filter((c) => c.method === "PATCH" && c.url.includes("/recovery_logs"));

// Reusable realistic payloads -------------------------------------------------
const paylensLinkPaid = {
  event: "payment_link.paid",
  payload: {
    payment_link: {
      entity: {
        id: "plink_5dc2f764bf7ba97b51ff8",
        notes: { original_transaction_id: PAYLENS_TX, merchant_id: "merchant_1" },
      },
    },
    payment: { entity: { id: "pay_abcd1234", notes: {} } },
  },
};

const foreignLinkPaid = {
  event: "payment_link.paid",
  payload: {
    payment_link: { entity: { id: "plink_foreign_not_in_logs", notes: null } },
    payment: { entity: { id: "pay_foreign1", notes: {} } },
  },
};

const legacyLinkPaid = {
  event: "payment_link.paid",
  payload: {
    payment_link: { entity: { id: "plink_legacy", notes: null } },
    payment: { entity: { id: "pay_legacy1", notes: {} } },
  },
};

const unmatchedCaptured = {
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_captured_standard",
        notes: { merchant_id: "merchant_1", source: "paylens_test_checkout" },
      },
    },
  },
};

const notesBearingCaptured = {
  event: "payment.captured",
  payload: {
    payment: {
      entity: { id: "pay_captured_link_payment", notes: { original_transaction_id: PAYLENS_TX } },
    },
  },
};

async function main() {
  try {
    await startServer();

    // ------------------------------------------------------------------
    // 1. A signature computed over the EXACT raw body is ACCEPTED, and the
    //    PayLens payment_link.paid still updates ONLY the matching row.
    //    This also proves the raw Buffer (not JSON.stringify(Buffer)) is
    //    hashed: the signature here is generated from the raw text, which
    //    only matches when the handler hashes the raw bytes.
    // ------------------------------------------------------------------
    restCalls.length = 0;
    {
      const res = await postWebhook(paylensLinkPaid, "valid");
      assert.strictEqual(res.status, 200, `valid signature was rejected: ${JSON.stringify(res.json)}`);
      assert.ok(
        res.json.message.includes("Payment recovery recorded"),
        `unexpected ack message: ${res.json.message}`
      );
      const tx = failedPatches();
      assert.strictEqual(tx.length, 1, "expected exactly one failed_transactions PATCH");
      assert.ok(
        tx[0].url.includes(`id=eq.${PAYLENS_TX}`),
        `expected update scoped to ${PAYLENS_TX}; got ${tx[0].url}`
      );
      assert.strictEqual(logPatches().length, 1, "expected the recovery_logs PAID update");
      passed += 1;
      console.log("  ✓ Valid raw-body signature accepted; PayLens link updates ONLY the matching transaction");
    }

    // ------------------------------------------------------------------
    // 2. An arbitrary INVALID signature is REJECTED with 400 and no
    //    database request is made.
    // ------------------------------------------------------------------
    restCalls.length = 0;
    {
      const res = await postWebhook(paylensLinkPaid, "invalid");
      assert.strictEqual(res.status, 400, "expected 400 for an invalid signature");
      assert.strictEqual(res.json.error, "Invalid webhook signature");
      assert.strictEqual(restCalls.length, 0, "no database request may follow a rejected signature");
      passed += 1;
      console.log("  ✓ Invalid signature rejected (400), no DB access");
    }

    // ------------------------------------------------------------------
    // 3. Negative control for the original defect: a signature generated
    //    over JSON.stringify(Buffer.from(body)) (the previous hashing of the
    //    rawBody Buffer) must now be REJECTED — proving the handler hashes
    //    the raw Buffer bytes directly, not its JSON wrapper.
    // ------------------------------------------------------------------
    restCalls.length = 0;
    {
      const res = await postWebhook(paylensLinkPaid, "old-bug");
      assert.strictEqual(res.status, 400, "expected 400 when signature is computed over JSON.stringify(Buffer)");
      assert.strictEqual(res.json.error, "Invalid webhook signature");
      assert.strictEqual(restCalls.length, 0, "no database request may follow a rejected signature");
      passed += 1;
      console.log("  ✓ JSON.stringify(Buffer) signature rejected — raw Buffer bytes are hashed");
    }

    // ------------------------------------------------------------------
    // 4. A MISSING signature with a secret configured is REJECTED (400)
    //    and no database request is made (header behavior preserved).
    // ------------------------------------------------------------------
    restCalls.length = 0;
    {
      const res = await postWebhook(paylensLinkPaid, "none");
      assert.strictEqual(res.status, 400, "expected 400 for a missing signature");
      assert.strictEqual(res.json.error, "Missing x-razorpay-signature header");
      assert.strictEqual(restCalls.length, 0, "no database request may follow a rejected signature");
      passed += 1;
      console.log("  ✓ Missing signature rejected (400), no DB access");
    }

    // ------------------------------------------------------------------
    // 5. Foreign payment link (valid signature, no log row, no notes
    //    reference) -> acknowledged but NO failed_transactions write.
    // ------------------------------------------------------------------
    restCalls.length = 0;
    {
      const res = await postWebhook(foreignLinkPaid, "valid");
      assert.strictEqual(res.status, 200, "foreign payment_link.paid must still be acked 200");
      assert.strictEqual(
        failedPatches().length,
        0,
        "foreign payment_link.paid must NOT update failed_transactions"
      );
      passed += 1;
      console.log("  ✓ Foreign payment_link.paid causes NO failed_transactions update");
    }

    // ------------------------------------------------------------------
    // 6. Legacy PayLens link (notes lost): transaction resolved via
    //    recovery_logs.payment_link_id -> exactly ONE scoped update.
    // ------------------------------------------------------------------
    restCalls.length = 0;
    {
      const res = await postWebhook(legacyLinkPaid, "valid");
      assert.strictEqual(res.status, 200, "expected 200 for legacy-link fallback");
      const tx = failedPatches();
      assert.strictEqual(tx.length, 1, "expected exactly one failed_transactions PATCH");
      assert.ok(
        tx[0].url.includes(`id=eq.${LEGACY_TX}`),
        `expected update scoped via recovery_logs to ${LEGACY_TX}; got ${tx[0].url}`
      );
      passed += 1;
      console.log("  ✓ recovery_logs fallback resolves and scopes the update");
    }

    // ------------------------------------------------------------------
    // 7. payment.captured with no PayLens reference (standard checkout) ->
    //    acknowledged but NO failed_transactions and NO recovery_logs write.
    // ------------------------------------------------------------------
    restCalls.length = 0;
    {
      const res = await postWebhook(unmatchedCaptured, "valid");
      assert.strictEqual(res.status, 200, "unmatched payment.captured must still be acked 200");
      assert.strictEqual(
        failedPatches().length,
        0,
        "unmatched payment.captured must NOT update failed_transactions"
      );
      assert.strictEqual(
        logPatches().length,
        0,
        "no recovery_logs update is allowed without a genuine payment-link id"
      );
      passed += 1;
      console.log("  ✓ Unmatched payment.captured causes NO failed_transactions update");
    }

    // ------------------------------------------------------------------
    // 8. payment.captured carrying the PayLens-stamped notes reference ->
    //    exactly ONE scoped update.
    // ------------------------------------------------------------------
    restCalls.length = 0;
    {
      const res = await postWebhook(notesBearingCaptured, "valid");
      assert.strictEqual(res.status, 200, "expected 200 for notes-bearing payment.captured");
      const tx = failedPatches();
      assert.strictEqual(tx.length, 1, "expected exactly one failed_transactions PATCH");
      assert.ok(
        tx[0].url.includes(`id=eq.${PAYLENS_TX}`),
        `expected update scoped to ${PAYLENS_TX}; got ${tx[0].url}`
      );
      passed += 1;
      console.log("  ✓ Notes-bearing payment.captured scopes to the exact transaction");
    }

    // ------------------------------------------------------------------
    // 9. Global invariant: across every request in this run, an unscoped
    //    failed_transactions PATCH was never issued.
    // ------------------------------------------------------------------
    {
      const unscoped = allCalls.filter(
        (c) => c.method === "PATCH" && c.url.includes("/failed_transactions") && !c.url.includes("id=eq.")
      );
      assert.strictEqual(
        unscoped.length,
        0,
        `an unscoped failed_transactions PATCH was issued: ${JSON.stringify(unscoped)}`
      );
      passed += 1;
      console.log("  ✓ No unscoped failed_transactions PATCH was ever issued");
    }

    await stopServer();
    console.log(`\nAll ${passed} webhook regression checks passed.`);
  } catch (err) {
    console.error("\nFAIL:", err.message);
    process.exitCode = 1;
    try {
      await stopServer();
    } catch {
      /* already closed */
    }
  } finally {
    if (previousSecret === undefined) delete process.env.RAZORPAY_WEBHOOK_SECRET;
    else process.env.RAZORPAY_WEBHOOK_SECRET = previousSecret;
  }
}

main();
