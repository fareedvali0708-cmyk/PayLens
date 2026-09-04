# PayLens Screenshot Directory

This directory stores curated screenshots of the verified PayLens end-to-end recovery pipeline running in Razorpay Test Mode.

## Recommended Screenshots

To maintain professional showcase quality, use the following standardized filenames and specifications:

| Filename | Capture Stage | Engineering & Product Value Caption |
| :--- | :--- | :--- |
| `01-login.png` | Authentication | Merchant login screen authenticating session state via Supabase Auth and setting JWT context. |
| `02-overview-pending.png` | Ingestion & Telemetry | Live merchant overview dashboard showing an intercepted Razorpay payment failure captured as `PENDING` with order metadata. |
| `03-diagnostics.png` | AI Diagnostics | Transaction inspection drawer displaying error classification, raw gateway codes, and non-blocking Gemini AI remediation guidance. |
| `04-recovery-link.png` | Recovery Dispatch | Merchant recovery action triggering Razorpay Payment Link generation via authenticated API endpoint. |
| `05-razorpay-test-success.png` | Customer Retry | Customer-facing Razorpay checkout simulation page successfully completing payment in Test Mode. |
| `06-overview-recovered.png` | State Reconciliation | Reconciled overview dashboard confirming the same transaction updated to `RECOVERED` via webhook with incremented yield metrics. |

## Image Guidelines
- **Resolution**: 1920x1080 or 1440x900 standard desktop viewports.
- **Format**: PNG with lossy or lossless compression (keep file sizes under 1MB per image).
- **Security**: Ensure no real personal customer data, production cards, or actual secret keys appear in captured views.
