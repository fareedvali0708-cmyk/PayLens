require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
  );
}

/**
 * Service-role Supabase client.
 * This bypasses RLS — use ONLY on the server for operations that
 * require elevated privileges (e.g. webhook ingestion).
 *
 * For user-scoped queries, create a per-request client with the
 * user's JWT instead (see authMiddleware).
 */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };
