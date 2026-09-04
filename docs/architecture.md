# Architecture Overview

```mermaid
flowchart TD
    subgraph Client
        A[React/Vite UI]
        B[API Calls]
    end
    subgraph Server
        C[Express.js REST API]
        D[Razorpay Integration]
        E[Supabase Client]
    end
    subgraph Supabase
        F[PostgreSQL DB]
        G[RLS Policies]
    end
    A --> B --> C --> D
    C --> E --> F
    E --> G
    D --> F
```

The **Client** (React/Vite) communicates with the **Server** via REST endpoints. The server handles Razorpay webhooks, creates payment links, and accesses Supabase for data storage with row‑level security (RLS). All secrets are kept on the server side.
