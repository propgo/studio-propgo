-- Atomic credit refund function (mirrors deduct_credits in reverse)
-- Restores monthly_credits first, then topup_credits (mirrors drain order).
-- Called when generation fails or task enqueue errors out.

CREATE OR REPLACE FUNCTION video.refund_credits(p_user_id UUID, p_amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan         TEXT;
  v_plan_limit   INT;
  v_monthly      INT;
  v_headroom     INT;
  v_to_monthly   INT;
  v_to_topup     INT;
BEGIN
  SELECT plan, monthly_credits INTO v_plan, v_monthly
  FROM video.wallets WHERE user_id = p_user_id;

  -- Determine how much room is left in monthly bucket (cap at plan limit)
  v_plan_limit := CASE v_plan
    WHEN 'starter' THEN 500
    WHEN 'pro'     THEN 1500
    WHEN 'agency'  THEN 5000
    ELSE 100  -- free
  END;

  v_headroom   := GREATEST(0, v_plan_limit - v_monthly);
  v_to_monthly := LEAST(p_amount, v_headroom);
  v_to_topup   := p_amount - v_to_monthly;

  UPDATE video.wallets
  SET
    monthly_credits = monthly_credits + v_to_monthly,
    topup_credits   = topup_credits   + v_to_topup,
    updated_at      = NOW()
  WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION video.refund_credits(UUID, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION video.refund_credits(UUID, INT) TO service_role;
