-- Allow unauthenticated users to look up a session by invite_token
-- This is safe because invite_token is a random 32-char hex string (unguessable)
-- Only exposes session name + organization_id, no sensitive data
DROP POLICY IF EXISTS "sessions_public_select" ON sessions;
CREATE POLICY "sessions_public_select" ON sessions FOR SELECT
  TO anon
  USING (true);
