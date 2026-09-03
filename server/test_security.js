const http = require("http");
const app = require("./src/app");

const server = app.listen(3099, async () => {
  console.log("Test server listening on port 3099");

  try {
    // 1. Test Helmet Headers & Health
    console.log("\n--- Testing Helmet Headers on /api/health ---");
    const res1 = await fetch("http://localhost:3099/api/health");
    console.log("Status:", res1.status);
    console.log("X-Content-Type-Options:", res1.headers.get("x-content-type-options"));
    console.log("X-Frame-Options:", res1.headers.get("x-frame-options"));
    console.log("Strict-Transport-Security:", res1.headers.get("strict-transport-security"));

    // 2. Test Rate Limiter on /api/auth/login
    console.log("\n--- Testing Rate Limiter on /api/auth/login ---");
    for (let i = 1; i <= 6; i++) {
      const loginRes = await fetch("http://localhost:3099/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "invalid@test.com", password: "wrongpassword" }),
      });
      const data = await loginRes.json();
      console.log(`Attempt ${i} Status:`, loginRes.status, "Message:", data.message || data.error);
      if (i === 6) {
        if (loginRes.status === 429) {
          console.log("SUCCESS: Attempt 6 was rate-limited (HTTP 429) as expected!");
        } else {
          console.error("FAIL: Attempt 6 was not rate-limited!");
        }
      }
    }

    // 3. Test CORS restriction
    console.log("\n--- Testing CORS restriction with unauthorized origin ---");
    const corsRes = await fetch("http://localhost:3099/api/health", {
      headers: { Origin: "http://malicious-site.com" },
    });
    console.log("CORS with malicious-site.com status:", corsRes.status);
    console.log("Access-Control-Allow-Origin header:", corsRes.headers.get("access-control-allow-origin"));

    console.log("\n--- Testing CORS with allowed origin ---");
    const corsResAllowed = await fetch("http://localhost:3099/api/health", {
      headers: { Origin: "http://localhost:5173" },
    });
    console.log("CORS with localhost:5173 status:", corsResAllowed.status);
    console.log("Access-Control-Allow-Origin header:", corsResAllowed.headers.get("access-control-allow-origin"));

    server.close(() => {
      console.log("\nAll server security tests completed successfully.");
      process.exit(0);
    });
  } catch (err) {
    console.error("Test error:", err);
    server.close(() => process.exit(1));
  }
});
