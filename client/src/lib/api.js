const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

/**
 * Centralized fetch wrapper that attaches the auth token and handles errors.
 */
async function request(path, token, options = {}) {
  const url = `${API_BASE}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(url, { ...options, headers })

  // Parse JSON regardless of status
  let body
  try {
    body = await res.json()
  } catch {
    body = null
  }

  if (!res.ok) {
    const error = new Error(body?.message || body?.error || `Request failed (${res.status})`)
    error.status = res.status
    error.body = body
    throw error
  }

  return body
}

/**
 * GET /api/transactions
 * Fetches all failed transactions for the authenticated merchant.
 * @param {string} token - Supabase JWT
 * @param {string} [status] - Optional status filter
 * @param {string} [search] - Optional search term
 */
export async function getTransactions(token, status, search) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (search) params.set('search', search)
  const qs = params.toString()
  return request(`/transactions${qs ? `?${qs}` : ''}`, token)
}

/**
 * GET /api/metrics
 * Fetches recovery analytics and KPI metrics.
 */
export async function getMetrics(token) {
  return request('/metrics', token)
}

/**
 * POST /api/transactions/:id/recover
 * Initiates payment recovery for a failed transaction.
 * Handles 429 cooldown errors gracefully.
 */
export async function recoverTransaction(token, id) {
  return request(`/transactions/${id}/recover`, token, { method: 'POST' })
}

/**
 * GET /api/health
 * Server health check (no auth required).
 */
export async function checkHealth() {
  return request('/health', null)
}

/**
 * GET /api/settings
 * Fetches settings for the authenticated merchant.
 * @param {string} token - Supabase JWT
 */
export async function getSettings(token) {
  return request('/settings', token)
}

/**
 * PUT /api/settings
 * Updates merchant profile and Razorpay credentials.
 * @param {string} token - Supabase JWT
 * @param {object} settingsData - Settings payload
 */
export async function updateSettings(token, settingsData) {
  return request('/settings', token, {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  })
}

/**
 * POST /api/checkout/create-order
 * Generates a Razorpay Test Mode checkout order (unauthenticated customer demo).
 * @param {number} amount - Amount in INR (default 1499)
 */
export async function createCheckoutOrder(amount = 1499) {
  return request('/checkout/create-order', null, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}
