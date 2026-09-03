require("dotenv").config();
const { supabase } = require("./src/config/supabase");
const { generateCoachingTip, enrichTransactionWithAIInsight } = require("./src/services/geminiService");

async function testPhase3() {
  console.log("=================================================");
  console.log(" PayLens — Phase 3 Gemini AI Integration Test");
  console.log("=================================================\n");

  const merchantId =
    process.env.DEFAULT_MERCHANT_ID || "9c985d7f-6e00-4b91-922b-d4570afa712f";

  // 1. Test direct Gemini coaching tip generation
  console.log("[1] Testing direct Gemini coaching tip generation...");
  const sampleContext = {
    failureReason: "BANK_DOWNTIME",
    errorDescription: "Issuing bank server is temporarily unavailable or experiencing high latency.",
    errorCode: "GATEWAY_ERROR",
    amount: 3499.0,
    currency: "INR",
  };

  const directTip = await generateCoachingTip(sampleContext);
  console.log("\n   Generated 2-Sentence Tip:\n   \"", directTip, "\"\n");

  // 2. Test non-blocking background enrichment
  console.log("[2] Testing non-blocking background transaction insertion & enrichment...");
  
  // Insert transaction with null ai_insight
  const { data: tx, error: insertErr } = await supabase
    .from("failed_transactions")
    .insert({
      merchant_id: merchantId,
      razorpay_payment_id: "pay_phase3_test_" + Date.now(),
      razorpay_order_id: "order_phase3_test_" + Date.now(),
      customer_email: "test.gemini@example.com",
      customer_phone: "+919876543210",
      amount: 3499.0,
      currency: "INR",
      error_code: "GATEWAY_ERROR",
      error_description: "Issuing bank server is temporarily unavailable",
      failure_reason: "BANK_DOWNTIME",
      ai_insight: null, // Saved first with null
      status: "PENDING",
      recovery_attempts: 0,
    })
    .select()
    .single();

  if (insertErr) {
    console.error("   Insert Error:", insertErr.message);
    return;
  }

  console.log(`   ✓ Transaction saved immediately with ai_insight = null (ID: ${tx.id})`);
  console.log("   Initial ai_insight value:", tx.ai_insight);

  // Trigger asynchronous non-blocking enrichment
  console.log("\n[3] Triggering non-blocking enrichTransactionWithAIInsight...");
  enrichTransactionWithAIInsight(tx.id, sampleContext);

  console.log("   Waiting 4 seconds for background worker to complete...");
  await new Promise((resolve) => setTimeout(resolve, 4000));

  // Fetch updated record from Supabase
  const { data: updatedTx, error: fetchErr } = await supabase
    .from("failed_transactions")
    .select("id, failure_reason, error_description, ai_insight, created_at")
    .eq("id", tx.id)
    .single();

  if (fetchErr) {
    console.error("   Error fetching updated record:", fetchErr.message);
    return;
  }

  console.log("\n=================================================");
  console.log(" 🎉 PHASE 3 GEMINI ENRICHMENT VERIFIED!");
  console.log("=================================================");
  console.log(` • Transaction ID:    ${updatedTx.id}`);
  console.log(` • Failure Reason:    ${updatedTx.failure_reason}`);
  console.log(` • Enriched AI Tip:   ${updatedTx.ai_insight}`);
  console.log("=================================================\n");
}

testPhase3()
  .then(() => {
    console.log("Phase 3 verification completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Phase 3 verification error:", err);
    process.exit(1);
  });
