-- ============================================================
-- PayLens: Initial Database Schema
-- Migration 001 — Tables, RLS Policies
-- ============================================================

-- Enable the pgcrypto extension for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. MERCHANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS merchants (
    id              UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    business_name   TEXT NOT NULL,
    razorpay_key_id  TEXT ,
    razorpay_key_secret  TEXT,
    razorpay_webhook_secret TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- Merchants can read only their own row
CREATE POLICY "merchants_select_own"
    ON merchants FOR SELECT
    USING (id = auth.uid());

-- Merchants can insert their own row (id must match their auth uid)
CREATE POLICY "merchants_insert_own"
    ON merchants FOR INSERT
    WITH CHECK (id = auth.uid());

-- Merchants can update only their own row
CREATE POLICY "merchants_update_own"
    ON merchants FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Merchants can delete only their own row
CREATE POLICY "merchants_delete_own"
    ON merchants FOR DELETE
    USING (id = auth.uid());


-- ============================================================
-- 2. FAILED TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS failed_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id         UUID NOT NULL REFERENCES merchants (id) ON DELETE CASCADE,
    razorpay_payment_id TEXT,
    razorpay_order_id   TEXT,
    customer_email      TEXT,
    customer_phone      TEXT,
    amount              NUMERIC NOT NULL,
    currency            TEXT NOT NULL DEFAULT 'INR',
    error_code          TEXT,
    error_description   TEXT,
    failure_reason      TEXT,
    ai_insight          TEXT,
    status              TEXT NOT NULL DEFAULT 'PENDING',
    recovery_attempts   INTEGER NOT NULL DEFAULT 0,
    last_recovery_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE failed_transactions ENABLE ROW LEVEL SECURITY;

-- Merchants can only see their own failed transactions
CREATE POLICY "failed_transactions_select_own"
    ON failed_transactions FOR SELECT
    USING (merchant_id = auth.uid());

CREATE POLICY "failed_transactions_insert_own"
    ON failed_transactions FOR INSERT
    WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "failed_transactions_update_own"
    ON failed_transactions FOR UPDATE
    USING (merchant_id = auth.uid())
    WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "failed_transactions_delete_own"
    ON failed_transactions FOR DELETE
    USING (merchant_id = auth.uid());


-- ============================================================
-- 3. RECOVERY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS recovery_logs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id    UUID NOT NULL REFERENCES failed_transactions (id) ON DELETE CASCADE,
    payment_link_id   TEXT,
    payment_link_url  TEXT,
    status            TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE recovery_logs ENABLE ROW LEVEL SECURITY;

-- Recovery logs belong to a transaction which belongs to a merchant.
-- The merchant can only see recovery logs for their own transactions.
CREATE POLICY "recovery_logs_select_own"
    ON recovery_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM failed_transactions ft
            WHERE ft.id = recovery_logs.transaction_id
              AND ft.merchant_id = auth.uid()
        )
    );

CREATE POLICY "recovery_logs_insert_own"
    ON recovery_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM failed_transactions ft
            WHERE ft.id = recovery_logs.transaction_id
              AND ft.merchant_id = auth.uid()
        )
    );

CREATE POLICY "recovery_logs_update_own"
    ON recovery_logs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM failed_transactions ft
            WHERE ft.id = recovery_logs.transaction_id
              AND ft.merchant_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM failed_transactions ft
            WHERE ft.id = recovery_logs.transaction_id
              AND ft.merchant_id = auth.uid()
        )
    );

CREATE POLICY "recovery_logs_delete_own"
    ON recovery_logs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM failed_transactions ft
            WHERE ft.id = recovery_logs.transaction_id
              AND ft.merchant_id = auth.uid()
        )
    );


-- ============================================================
-- INDEXES for common query patterns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_failed_transactions_merchant
    ON failed_transactions (merchant_id);

CREATE INDEX IF NOT EXISTS idx_failed_transactions_status
    ON failed_transactions (status);

CREATE INDEX IF NOT EXISTS idx_failed_transactions_created
    ON failed_transactions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recovery_logs_transaction
    ON recovery_logs (transaction_id);
