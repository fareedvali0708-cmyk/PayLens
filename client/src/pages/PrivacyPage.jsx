import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-border">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-primary transition"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Sign In</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-heading text-sm font-bold text-primary">PayLens</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-surface rounded-xl border border-border p-6 sm:p-10 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
              Legal &amp; Compliance
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-primary mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs text-text-muted mt-2">Last updated: September 2026</p>
          </div>

          <div className="prose prose-sm text-xs text-text-secondary space-y-5 leading-relaxed">
            <p>
              PayLens (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates an authenticated payment
              failure recovery engine designed specifically for Razorpay merchants. This Privacy Policy
              describes how merchant account credentials and payment recovery data are handled.
            </p>

            <h2 className="text-sm font-bold text-primary font-heading mt-6">
              1. Information We Process
            </h2>
            <p>
              We process only transactional and technical information necessary to diagnose payment
              failures and facilitate smart link recovery:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
              <li>
                <strong>Merchant Account Information:</strong> Store name, registered business email,
                and encrypted Razorpay API credentials.
              </li>
              <li>
                <strong>Transaction Metadata:</strong> Razorpay order ID, payment attempt timestamp,
                amount, currency, failure reason code, and customer contact identifier (email/phone).
              </li>
              <li>
                <strong>Security Logs:</strong> Request timestamps, IP addresses for brute-force rate
                limiting, and authentication session tokens.
              </li>
            </ul>

            <h2 className="text-sm font-bold text-primary font-heading mt-6">
              2. How Information is Used
            </h2>
            <p>
              Information collected is strictly utilized to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
              <li>Perform AI-driven failure categorization via Gemini models for root-cause diagnosis.</li>
              <li>Generate Razorpay-hosted smart payment recovery links on behalf of the merchant.</li>
              <li>Enforce rate-limiting, mitigate credential stuffing, and safeguard merchant API keys.</li>
            </ul>

            <h2 className="text-sm font-bold text-primary font-heading mt-6">
              3. Data Protection &amp; Retention
            </h2>
            <p>
              All merchant credentials and API keys are stored in encrypted form with Row-Level Security
              (RLS) enforced at the database layer. We do not sell, rent, or trade merchant or customer
              data to third parties or advertising networks.
            </p>

            <h2 className="text-sm font-bold text-primary font-heading mt-6">
              4. Merchant Rights &amp; Inquiries
            </h2>
            <p>
              Merchants retain full control over their configured API credentials and can update or
              remove them at any time through the dashboard Settings panel.
            </p>
          </div>

          <div className="pt-6 border-t border-border flex justify-between items-center text-xs text-text-muted">
            <span>&copy; {new Date().getFullYear()} PayLens. All rights reserved.</span>
            <Link to="/terms" className="text-primary hover:underline font-medium">
              Terms of Service &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
