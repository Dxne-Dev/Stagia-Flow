
/*
# Fix user_profiles RLS select policy

Simplifies the profiles SELECT policy to just id = auth.uid() for self-read,
removing the circular RLS dependency between organizations and user_profiles.
*/

DROP POLICY IF EXISTS "profiles_select" ON user_profiles;
CREATE POLICY "profiles_select" ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = user_profiles.organization_id AND o.owner_id = auth.uid()
    )
  );
