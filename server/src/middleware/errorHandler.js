/**
 * Global error-handling middleware.
 *
 * Express recognises this as an error handler because it has 4 parameters.
 * Must be registered AFTER all routes.
 */
function errorHandler(err, _req, res, _next) {
  // Safe logging without crashing
  try {
    console.error("[ErrorHandler]", err?.message || err);
  } catch {
    // Ignore logging failures
  }

  // Zod validation errors
  if (err?.name === "ZodError" || (err && Array.isArray(err.issues))) {
    const formattedIssues = (err.issues || err.errors || []).map((issue) => ({
      field: issue.path ? issue.path.join(".") : "unknown",
      message: issue.message || "Invalid value",
    }));

    return res.status(400).json({
      error: "Validation Error",
      message: "The request payload failed validation.",
      details: formattedIssues,
    });
  }

  // JSON parse errors from malformed request bodies
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Bad Request",
      message: "Invalid JSON in request body.",
    });
  }

  const statusCode = typeof err?.statusCode === "number" ? err.statusCode : typeof err?.status === "number" ? err.status : 500;

  return res.status(statusCode).json({
    error: statusCode === 500 ? "Internal Server Error" : err?.message || "An unexpected error occurred",
    message: err?.message || undefined,
    ...(process.env.NODE_ENV !== "production" && err?.stack ? { stack: err.stack } : {}),
  });
}

module.exports = { errorHandler };
