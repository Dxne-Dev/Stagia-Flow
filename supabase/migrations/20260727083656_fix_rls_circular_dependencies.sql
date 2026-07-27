
/*
# Fix organizations RLS circular dependency

The org SELECT policy checked user_profiles which itself checked organizations,
causing an infinite loop. Now we use a security definer function to break the cycle.
Since the simpler approach is to split ownership (owner_id direct check) from
membership (subquery on user_profiles without the back-reference to organizations),
we rebuild the policy carefully.
*/

-- Simpler: orgs are visible to their owner, and to users whose profile points to that org
DROP POLICY IF EXISTS "org_select" ON organizations;
CREATE POLICY "org_select" ON organizations FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid()
        AND organization_id IS NOT NULL
    )
  );

-- Also fix sessions policy to avoid circular reference
DROP POLICY IF EXISTS "sessions_select" ON sessions;
CREATE POLICY "sessions_select" ON sessions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
    OR organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
  );

-- Fix projects policy
DROP POLICY IF EXISTS "projects_select" ON projects;
CREATE POLICY "projects_select" ON projects FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      WHERE s.organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
        UNION
        SELECT organization_id FROM user_profiles
        WHERE id = auth.uid() AND organization_id IS NOT NULL
      )
    )
  );

-- Fix deliverables policy
DROP POLICY IF EXISTS "deliverables_select" ON deliverables;
CREATE POLICY "deliverables_select" ON deliverables FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR project_id IN (
      SELECT p.id FROM projects p
      JOIN sessions s ON s.id = p.session_id
      WHERE s.organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
        UNION
        SELECT organization_id FROM user_profiles
        WHERE id = auth.uid() AND organization_id IS NOT NULL
          AND role IN ('admin', 'manager')
      )
    )
  );
