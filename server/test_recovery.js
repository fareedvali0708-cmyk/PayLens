require("dotenv").config();
const Razorpay = require("razorpay");
const { supabase } = require("./src/config/supabase");

async function testRecoveryFlow() {
  console.log("=================================================");
  console.log(" PayLens — Live Razorpay Test Mode Recovery Test");
  console.log("=================================================");

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in .env");
  }

  console.log(`\n[1] Initializing Razorpay SDK with Key ID: ${keyId}`);
  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const merchantId =
    process.env.DEFAULT_MERCHANT_ID || "9c985d7f-6e00-4b91-922b-d4570afa712f";

  // 1. Try to fetch a PENDING failed transaction from Supabase
  console.log(`\n[2] Checking for PENDING failed transactions for merchant: ${merchantId}`);
  let targetTx = null;

  try {
    const { data: txList, error } = await supabase
      .from("failed_transactions")
      .select("*")
      .eq("merchant_id", merchantId)
      .eq("status", "PENDING")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.warn("   Supabase Query Note:", error.message);
    } else if (txList && txList.length > 0) {
      targetTx = txList[0];
      console.log(`   Found existing PENDING transaction ID: ${targetTx.id}`);
    }
  } catch (err) {
    console.warn("   DB query exception:", err.message);
  }

  // If no transaction found in DB, use synthetic transaction data for testing Razorpay API
  if (!targetTx) {
    console.log("   No pending DB record found, creating synthetic test transaction data...");
    targetTx = {
      id: "test-tx-" + Date.now(),
      amount: 1499.0,
      currency: "INR",
      customer_email: "customer.recovery.test@example.com",
      customer_phone: "+919876543210",
      razorpay_order_id: "order_test_" + Math.random().toString(36).substring(2, 8),
      failure_reason: "BANK_DOWNTIME",
      recovery_attempts: 0,
    };
  }

  console.log("\n[3] Transaction Details for Recovery:");
  console.log(`   • Transaction ID:  ${targetTx.id}`);
  console.log(`   • Amount:          ₹${targetTx.amount} ${targetTx.currency}`);
  console.log(`   • Customer Email:  ${targetTx.customer_email}`);
  console.log(`   • Customer Phone:  ${targetTx.customer_phone}`);

  // 2. Call Razorpay API to generate live Payment Link
  console.log("\n[4] Calling Razorpay Payment Link API (paymentLink.create)...");
  const amountInPaise = Math.round(Number(targetTx.amount) * 100);
  const expireBy = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours

  const paymentLinkPayload = {
    amount: amountInPaise,
    currency: targetTx.currency || "INR",
    accept_partial: false,
    description: `PayLens Recovery for ${targetTx.razorpay_order_id || targetTx.id}`,
    customer: {
      name: "Valued Customer",
      email: targetTx.customer_email || "customer@example.com",
      contact: targetTx.customer_phone || "+919876543210",
    },
    notify: {
      sms: false,
      email: false,
    },
    reminder_enable: false,
    expire_by: expireBy,
    notes: {
      original_transaction_id: String(targetTx.id),
      merchant_id: merchantId,
      recovery_engine: "PayLens_v1",
    },
  };

  const paymentLink = await razorpay.paymentLink.create(paymentLinkPayload);

  console.log("\n=================================================");
  console.log(" 🎉 REAL RAZORPAY TEST PAYMENT LINK CREATED!");
  console.log("=================================================");
  console.log(` • Payment Link ID:    ${paymentLink.id}`);
  console.log(` • Short URL:          ${paymentLink.short_url}`);
  console.log(` • Status:             ${paymentLink.status}`);
  console.log(` • Amount (in paise):  ${paymentLink.amount} (${paymentLink.currency})`);
  console.log(` • Expire By:          ${new Date(paymentLink.expire_by * 1000).toISOString()}`);
  console.log("=================================================\n");

  // 3. Attempt to record recovery log if DB permissions allow
  try {
    if (targetTx.id && !targetTx.id.startsWith("test-tx-")) {
      await supabase.from("recovery_logs").insert({
        transaction_id: targetTx.id,
        payment_link_id: paymentLink.id,
        payment_link_url: paymentLink.short_url,
        status: paymentLink.status.toUpperCase(),
      });

      await supabase
        .from("failed_transactions")
        .update({
          recovery_attempts: (targetTx.recovery_attempts || 0) + 1,
          last_recovery_at: new Date().toISOString(),
          status: "RECOVERY_SENT",
        })
        .eq("id", targetTx.id);

      console.log(" ✓ Database updated: status set to RECOVERY_SENT and recovery log created.");
    }
  } catch (dbErr) {
    console.log(" (Note: Supabase log update skipped:", dbErr.message, ")");
  }

  return paymentLink;
}

testRecoveryFlow()
  .then((link) => {
    console.log("Test completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Recovery Test Failed:", err);
    process.exit(1);
  });
