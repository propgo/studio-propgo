-- Grant authenticated and anon roles access to the video schema.
-- Without these, user-client (anon key + JWT) queries silently return null
-- even though RLS policies are correctly defined.

GRANT USAGE ON SCHEMA video TO authenticated, anon;

-- Read-only access for the user's own data (RLS enforces row-level scoping)
GRANT SELECT ON video.wallets           TO authenticated;
GRANT SELECT ON video.subscriptions     TO authenticated;
GRANT SELECT ON video.credit_transactions TO authenticated;
GRANT SELECT ON video.profiles          TO authenticated;

-- Full access for tables users manage directly
GRANT SELECT, INSERT, UPDATE, DELETE ON video.projects          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON video.project_photos    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON video.project_floor_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON video.storyboards       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON video.generations       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON video.profiles          TO authenticated;
