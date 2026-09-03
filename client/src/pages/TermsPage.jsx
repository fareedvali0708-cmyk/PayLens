import { Link } from 'react-router-dom'

export default function TermsPage() {
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
              Service Terms &amp; Agreement
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-primary mt-1">
              Terms of Service
            </h1>
            <p className="text-xs text-text-muted mt-2">Last updated: September 2026</p>
          </div>

          <div className="prose prose-sm text-xs text-text-secondary space-y-5 leading-relaxed">
            <p>
              These Terms of Service govern access to and use of the PayLens payment recovery
              platform. By registering an account or configuring Razorpay credentials, merchants agree
              to these Terms.
            </p>

            <h2 className="text-sm font-bold text-primary font-heading mt-6">
              1. Platform Usage &amp; Eligibility
            </h2>
            <p>
              PayLens provides automated webhook ingestion, failure classification, and payment recovery link
              generation for authorized Razorpay merchants. Merchants must maintain valid, active
              Razorpay credentials and comply with Razorpay&apos;s Merchant Terms and Acceptable Use Policy.
            </p>

            <h2 className="text-sm font-bold text-primary font-heading mt-6">
              2. Security &amp; Credentials Responsibility
            </h2>
            <p>
              Merchants are responsible for safeguarding their login credentials and ensuring their
              Razorpay API Keys and Webhook Secrets are not exposed. We implement strict rate-limiting
              and security controls; unauthorized attempts to access or scrape the platform are strictly prohibited.
            </p>

            <h2 className="text-sm font-bold text-primary font-heading mt-6">
              3. Payment Recovery &amp; Processing
            </h2>
            <p>
              PayLens facilitates payment recovery by generating payment links through the merchant&apos;s
              connected Razorpay account. Actual money settlement, fund transfer, and customer chargebacks
              remain subject to Razorpay&apos;s payment gateway terms and banking partner network availability.
            </p>

            <h2 className="text-sm font-bold text-primary font-heading mt-6">
              4. Disclaimer of Warranties
            </h2>
            <p>
              The platform and AI failure categorization insights are provided &ldquo;as is&rdquo; without warranty
              of 100% recovery rates, as bank downtimes and customer payment decisions are governed by
              factors outside platform control.
            </p>
          </div>

          <div className="pt-6 border-t border-border flex justify-between items-center text-xs text-text-muted">
            <span>&copy; {new Date().getFullYear()} PayLens. All rights reserved.</span>
            <Link to="/privacy" className="text-primary hover:underline font-medium">
              Privacy Policy &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
