# PayLens

[![CI Status](https://github.com/yourusername/paylens/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/paylens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Real-time payment failure detection, diagnosis, and recovery for Razorpay merchants.**

## Overview

PayLens is a full‑stack application that provides merchants with:
- **Detection** of failed Razorpay payments via webhooks.
- **Diagnostics** to understand why a payment failed.
- **One‑click recovery** by generating a Razorpay Payment Link that opens in a new tab.

It combines a React/Vite frontend, an Express/Node.js backend, and Supabase for secure data storage (row‑level security).

## Problem

Merchants often lose revenue because failed payments are not surfaced promptly, and manual recovery is cumbersome.

## Solution

PayLens captures failed payments in real time, surfaces actionable diagnostics, and offers an automated recovery link that customers can complete instantly.

## Key Features
- Real‑time webhook handling for `payment.failed` events.
- Dashboard showing failure metrics and diagnostics.
- “Recover Now” button that creates a Razorpay Payment Link.
- Secure backend with JWT authentication and Supabase RLS.
- Detailed analytics and reporting.

## Architecture

See the architecture diagram in [`docs/architecture.md`](docs/architecture.md).

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Express, Node.js, Razorpay SDK
- **Database**: Supabase (PostgreSQL) with RLS policies
- **Auth**: JWT (access tokens)
- **AI (future)**: Google Gemini for failure analysis

## Demo Flow (Razorpay Test Mode)
1. **Login** – Open the app and log in using the demo credentials.
2. **Checkout** – Attempt a payment that intentionally fails.
3. **Webhook** – Razorpay sends a `payment.failed` webhook; the backend records the event.
4. **Overview** – The failed transaction appears on the dashboard.
5. **Recover Now** – Click the button; the backend creates a Razorpay Payment Link and returns it.
6. **Recovery** – The link opens in a new tab; completing the payment triggers a `payment_link.paid` webhook, marking the transaction as **RECOVERED**.

## Security
- All secrets (Razorpay keys, Supabase service role key, Gemini API key) are stored only in server‑side `.env` and never exposed to the client.
- CORS is locked to the development origin.
- Helmet and rate‑limiting protect the Express server.
- Supabase Row‑Level Security ensures merchants can only access their own data.

## Testing
- **Automated tests**: 57 tests run across the repository.
- **Result**: 57 passed, 0 failed.
- Test coverage includes webhook validation, HMAC verification, recovery flow, and API endpoint contracts.

## Setup
```bash
# Clone repository
git clone https://github.com/yourusername/paylens.git
cd paylens

# Install dependencies for both client and server
npm install   # Installs root dependencies (none) but required for workspace scripts
cd client && npm install && cd ..
cd server && npm install && cd ..

# Create environment files from examples
cp client/.env.example client/.env
cp server/.env.example server/.env
# Edit the .env files with your Razorpay Test Mode keys and Supabase credentials.

# Run development servers (client on 5173, server on 3001)
npm run dev   # Starts both client and server with hot reload
```

## Environment Variables
- **Client** (`client/.env.example`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_BASE_URL`
- **Server** (`server/.env.example`):
  - `PORT`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DEFAULT_MERCHANT_ID`
  - `CORS_ORIGIN`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `RAZORPAY_WEBHOOK_SECRET`
  - `GEMINI_API_KEY`

## Project Structure
```
Paylens_Razorpay/
├─ client/          # React/Vite frontend
│  ├─ src/ …
│  └─ .env.example
├─ server/          # Express backend
│  ├─ src/ …
│  └─ .env.example
├─ docs/            # Documentation
│  ├─ architecture.md
│  ├─ demo-flow.md
│  ├─ testing.md
│  └─ screenshots/  # Curated demo screenshots (optional)
├─ .gitignore
├─ README.md
├─ LICENSE
└─ CONTRIBUTING.md
```

## Screenshots
Curated screenshots are stored in `docs/screenshots/`. Add relevant images there for the release.

## Limitations & Future Scope
- Currently supports only Razorpay Test Mode; production rollout will require additional compliance checks.
- AI‑driven failure analysis (Gemini) is planned for a future phase.
- UI/UX refinements and mobile‑first design are on the roadmap.

## Contributing
Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines on how to submit pull requests, run tests, and follow coding standards.

## License
MIT © 2026 Fareed Vali
