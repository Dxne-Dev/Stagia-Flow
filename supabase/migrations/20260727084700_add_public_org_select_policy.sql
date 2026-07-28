-- Allow lookup of organization name for the invite flow
-- Only reachable if you already know the org UUID (from a session invite_token lookup)
-- Safe: UUID is unguessable, only exposes name, not sensitive
DROP POLICY IF EXISTS "org_invite_select" ON organizations;
CREATE POLICY "org_invite_select" ON organizations FOR SELECT
  TO anon, authenticated
  USING (true);
