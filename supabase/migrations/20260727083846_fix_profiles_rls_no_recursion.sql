
/*
# Fix infinite RLS recursion - user_profiles SELECT

The user_profiles SELECT policy was checking organizations, which checked user_profiles,
causing infinite recursion. Fix: use ONLY id = auth.uid() for self-read.
Admin/manager visibility is handled by a separate non-recursive check via organizations.owner_id.
*/

DROP POLICY IF EXISTS "profiles_select" ON user_profiles;

-- Self-read: each user can always read their own profile
-- Admin read: org owners can read profiles of their org members
-- NO subquery into user_profiles to avoid recursion
CREATE POLICY "profiles_select" ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
  );

-- For managers to view stagiaire profiles, we need a separate policy
-- that only checks the organizations table (not user_profiles):
DROP POLICY IF EXISTS "profiles_select_manager" ON user_profiles;
CREATE POLICY "profiles_select_manager" ON user_profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );
