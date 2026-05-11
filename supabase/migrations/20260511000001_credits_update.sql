-- Credits update migration
-- 1. Update handle_new_user trigger: free plan now starts at 100 credits
-- 2. Backfill existing free-plan users who still have the old 20-credit default
-- 3. Add monthly reset for free-plan users via pg_cron
-- 4. Add index to speed up idempotency check in credit_transactions

-- ─── 1. Update trigger to grant 100 credits on signup ───────────────────────

CREATE OR REPLACE FUNCTION video.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO video.profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO video.wallets (user_id, monthly_credits, plan)
    VALUES (NEW.id, 100, 'free') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- ─── 2. Backfill existing free-plan users with the new 100-credit baseline ───
-- Only updates users still on the old default (≤ 20), so manually topped-up
-- balances are preserved.

UPDATE video.wallets
SET monthly_credits = 100
WHERE plan = 'free'
  AND monthly_credits <= 20;

-- ─── 3. Monthly reset for free-plan users via pg_cron ───────────────────────
-- Runs at 00:00 UTC on the 1st of every month.
-- Requires the pg_cron extension (enabled by default on Supabase).
-- Paid-plan resets are handled by Stripe invoice.payment_succeeded — this
-- covers only free-plan users who never get a Stripe webhook.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'studio-free-plan-monthly-reset',
      '0 0 1 * *',
      $$
        UPDATE video.wallets
        SET monthly_credits = 100,
            updated_at      = NOW()
        WHERE plan = 'free';
      $$
    );
  END IF;
END;
$$;

-- ─── 4. Index for idempotency check in generate-video task ──────────────────
-- Speeds up the SELECT … WHERE generation_id = ? AND type = 'generation_consume'
-- that guards against double-deduction on Trigger.dev retries.

CREATE INDEX IF NOT EXISTS idx_video_credit_tx_generation_id
  ON video.credit_transactions(generation_id)
  WHERE generation_id IS NOT NULL;
