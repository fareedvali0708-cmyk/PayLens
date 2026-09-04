# Testing & Validation

PayLens has been validated through a comprehensive suite of automated tests and a real Razorpay Test Mode end-to-end flow.

## Test Results

| Category | Tests | Passed | Failed |
|----------|-------|--------|--------|
| **Total** | **57** | **57** | **0** |

## Test Files

### `server/test_security.js`
Security-focused tests covering:
- Authentication enforcement on protected endpoints
- Unauthorized access rejection (401)
- Secret exposure scanning (ensures no credentials in responses)

### `server/test_webhook_scoping.js`
Webhook and merchant isolation tests covering:
- HMAC SHA-256 signature validation
- Timing-safe signature comparison
- Invalid/missing signature rejection
- Merchant data isolation (IDOR prevention)
- Webhook payload parsing
- Transaction scoping by merchant ID

### `server/test_recovery.js`
Recovery flow tests covering:
- Recovery endpoint authentication
- Payment Link creation via Razorpay API
- Transaction state transitions (PENDING → RECOVERED)
- Recovery attempt tracking
- Error handling for invalid transaction IDs

### `server/test_gemini_phase3.js`
AI integration tests covering:
- Gemini API connectivity
- Failure analysis prompt construction
- AI insight enrichment of transactions
- Graceful fallback when AI is unavailable

## Running the Tests

```bash
# Run all server tests
cd server
node test_security.js
node test_webhook_scoping.js
node test_recovery.js
node test_gemini_phase3.js
```

There is no `npm test` script configured. Tests are run directly with Node.js.

## End-to-End Verification

The complete Razorpay Test Mode flow has been verified manually:

1. Customer checkout with intentional failure
2. `payment.failed` webhook received and validated
3. Transaction recorded as `PENDING` in dashboard
4. "Recover Now" creates Razorpay Payment Link
5. Payment completed via Payment Link
6. `payment_link.paid` webhook updates status to `RECOVERED`
7. Dashboard metrics updated

**No production payments were used.** All testing was performed exclusively in Razorpay Test Mode.

## Adding New Tests

1. Create a new test file in `server/` following the naming pattern `test_<feature>.js`
2. Use Node.js `assert` or plain `console.log`-based assertions (no external test framework)
3. Test against the actual API endpoints with HTTP requests
4. Always use test/mock data — never hardcode real credentials
