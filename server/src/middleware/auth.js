const { createClient } = require("@supabase/supabase-js");

/**
 * Authentication middleware.
 *
 * Validates the Supabase JWT from the `Authorization: Bearer <token>` header.
 * On success, attaches the authenticated user object and a user-scoped
 * Supabase client to `req` so downstream handlers can make RLS-respecting queries.
 *
 * On failure, responds with 401 Unauthorized.
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or malformed Authorization header. Expected: Bearer <token>",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Token is empty.",
    });
  }

  try {
    // Verify the JWT using the service-role client
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: error?.message || "Invalid or expired token.",
      });
    }

    // Attach the authenticated user and admin client to the request
    req.user = user;
    req.supabase = supabaseAdmin;

    next();
  } catch (err) {
    console.error("[authMiddleware] Unexpected error:", err);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Token validation failed.",
    });
  }
}

module.exports = { authMiddleware };
