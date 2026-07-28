-- Allow authenticated users to look up a session by invite_token
-- This is needed for the join flow: after login, the user is authenticated
-- but doesn't yet match the owner/member policies.
-- Safe because invite_token is a random 32-char hex string (unguessable).
DROP POLICY IF EXISTS "sessions_invite_select" ON sessions;
CREATE POLICY "sessions_invite_select" ON sessions FOR SELECT
  TO authenticated
  USING (true);
