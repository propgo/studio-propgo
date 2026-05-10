-- Atomic credit deduction function (called by Trigger.dev service role)
CREATE OR REPLACE FUNCTION video.deduct_credits(p_user_id UUID, p_amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE video.wallets
  SET
    monthly_credits = GREATEST(0,
      CASE
        WHEN monthly_credits >= p_amount THEN monthly_credits - p_amount
        ELSE 0
      END
    ),
    topup_credits = GREATEST(0,
      CASE
        WHEN monthly_credits >= p_amount THEN topup_credits
        ELSE topup_credits - (p_amount - monthly_credits)
      END
    )
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execute to service role only
REVOKE ALL ON FUNCTION video.deduct_credits(UUID, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION video.deduct_credits(UUID, INT) TO service_role;
