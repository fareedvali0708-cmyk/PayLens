# Architecture Overview

## System Diagram

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React + Vite)"]
        UI["Dashboard UI"]
        Checkout["Test Checkout Page"]
        Recovery["Recovery Page"]
        Analytics["Analytics Page"]
    end

    subgraph Backend["Backend (Express + Node.js)"]
        API["REST API"]
        Auth["JWT Auth Middleware"]
        WebhookHandler["Webhook Handler"]
        RecoveryEngine["Recovery Engine"]
        Classifier["Failure Classifier"]
        GeminiService["Gemini AI Service"]
        RateLimiter["Rate Limiter"]
    end

    subgraph External["External Services"]
        Razorpay["Razorpay API"]
        Gemini["Google Gemini"]
    end

    subgraph Database["Supabase (PostgreSQL)"]
        Merchants["merchants"]
        Transactions["failed_transactions"]
        RecoveryLogs["recovery_logs"]
        RLS["Row-Level Security"]
    end

    UI -->|"API calls (Bearer JWT)"| API
    Checkout -->|"Create order"| API
    API --> Auth
    Auth --> RecoveryEngine
    Auth --> Classifier

    Razorpay -->|"payment.failed webhook"| WebhookHandler
    Razorpay -->|"payment_link.paid webhook"| WebhookHandler
    WebhookHandler -->|"HMAC SHA-256 validation"| WebhookHandler
    WebhookHandler --> Classifier
    WebhookHandler --> GeminiService
    GeminiService --> Gemini

    RecoveryEngine -->|"Create Payment Link"| Razorpay
    API --> RateLimiter

    WebhookHandler --> Transactions
    RecoveryEngine --> RecoveryLogs
    Auth -->|"RLS-scoped queries"| Merchants
    Auth -->|"RLS-scoped queries"| Transactions
    RLS -.->|"auth.uid() = merchant_id"| Transactions
    RLS -.->|"auth.uid() = id"| Merchants
```

## Component Breakdown

### Frontend
- **React 19** with **Vite** for fast HMR
- **TailwindCSS** for styling
- **React Router** for client-side routing
- **Supabase JS** for authentication

### Backend
- **Express 5** REST API
- **Helmet** for HTTP security headers
- **CORS** with origin allowlisting
- **Rate limiting** on sensitive endpoints
- **Raw body preservation** for webhook HMAC verification

### Database
- **Supabase** (hosted PostgreSQL)
- **Row-Level Security (RLS)** on all tables
- Policies enforce `auth.uid() = merchant_id` on every query
- Three core tables: `merchants`, `failed_transactions`, `recovery_logs`

### External Integrations
- **Razorpay SDK** — order creation, Payment Link generation, webhook ingestion
- **Google Gemini** — AI-powered failure analysis and merchant-facing insights

### Security Layers
1. JWT authentication on all protected endpoints
2. HMAC SHA-256 webhook signature validation with `crypto.timingSafeEqual`
3. Supabase RLS policies for merchant data isolation
4. Helmet security headers
5. CORS origin allowlisting
6. Rate limiting on auth endpoints
7. Server-side secret storage (no secrets exposed to client)
