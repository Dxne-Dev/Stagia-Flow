
/*
# StagePilot — RLS Policies (Part 2)

Adds all row-level security policies now that all tables exist.
Cross-table lookups via user_profiles are safe here.
*/

-- ORGANIZATIONS POLICIES
DROP POLICY IF EXISTS "org_select" ON organizations;
CREATE POLICY "org_select" ON organizations FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.organization_id = organizations.id
    )
  );

DROP POLICY IF EXISTS "org_insert" ON organizations;
CREATE POLICY "org_insert" ON organizations FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "org_update" ON organizations;
CREATE POLICY "org_update" ON organizations FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "org_delete" ON organizations;
CREATE POLICY "org_delete" ON organizations FOR DELETE
  TO authenticated USING (owner_id = auth.uid());

-- SESSIONS POLICIES
DROP POLICY IF EXISTS "sessions_select" ON sessions;
CREATE POLICY "sessions_select" ON sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = sessions.organization_id
        AND (
          o.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.organization_id = o.id
          )
        )
    )
  );

DROP POLICY IF EXISTS "sessions_insert" ON sessions;
CREATE POLICY "sessions_insert" ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_id AND o.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.organization_id = organization_id AND up.role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "sessions_update" ON sessions;
CREATE POLICY "sessions_update" ON sessions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = sessions.organization_id AND o.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = sessions.organization_id AND up.role IN ('admin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = sessions.organization_id AND o.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = sessions.organization_id AND up.role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "sessions_delete" ON sessions;
CREATE POLICY "sessions_delete" ON sessions FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = sessions.organization_id AND o.owner_id = auth.uid())
  );

-- USER PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select" ON user_profiles;
CREATE POLICY "profiles_select" ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM organizations o WHERE o.id = user_profiles.organization_id AND o.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = user_profiles.organization_id AND up.role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "profiles_insert" ON user_profiles;
CREATE POLICY "profiles_insert" ON user_profiles FOR INSERT
  TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update" ON user_profiles;
CREATE POLICY "profiles_update" ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM organizations o WHERE o.id = user_profiles.organization_id AND o.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = user_profiles.organization_id AND up.role IN ('admin', 'manager'))
  )
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM organizations o WHERE o.id = user_profiles.organization_id AND o.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = user_profiles.organization_id AND up.role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "profiles_delete" ON user_profiles;
CREATE POLICY "profiles_delete" ON user_profiles FOR DELETE
  TO authenticated USING (id = auth.uid());

-- PROJECTS POLICIES
DROP POLICY IF EXISTS "projects_select" ON projects;
CREATE POLICY "projects_select" ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN organizations o ON o.id = s.organization_id
      WHERE s.id = projects.session_id
        AND (
          o.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = o.id)
        )
    )
  );

DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN organizations o ON o.id = s.organization_id
      WHERE s.id = session_id
        AND (
          o.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = o.id AND up.role IN ('admin', 'manager'))
        )
    )
  );

DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_update" ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN organizations o ON o.id = s.organization_id
      WHERE s.id = projects.session_id
        AND (
          o.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = o.id AND up.role IN ('admin', 'manager'))
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN organizations o ON o.id = s.organization_id
      WHERE s.id = projects.session_id
        AND (
          o.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = o.id AND up.role IN ('admin', 'manager'))
        )
    )
  );

DROP POLICY IF EXISTS "projects_delete" ON projects;
CREATE POLICY "projects_delete" ON projects FOR DELETE
  TO authenticated USING (created_by = auth.uid());

-- DELIVERABLES POLICIES
DROP POLICY IF EXISTS "deliverables_select" ON deliverables;
CREATE POLICY "deliverables_select" ON deliverables FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects p
      JOIN sessions s ON s.id = p.session_id
      JOIN organizations o ON o.id = s.organization_id
      WHERE p.id = deliverables.project_id
        AND (
          o.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = o.id AND up.role IN ('admin', 'manager'))
        )
    )
  );

DROP POLICY IF EXISTS "deliverables_insert" ON deliverables;
CREATE POLICY "deliverables_insert" ON deliverables FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "deliverables_update" ON deliverables;
CREATE POLICY "deliverables_update" ON deliverables FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects p
      JOIN sessions s ON s.id = p.session_id
      JOIN organizations o ON o.id = s.organization_id
      WHERE p.id = deliverables.project_id
        AND (
          o.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = o.id AND up.role IN ('admin', 'manager'))
        )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects p
      JOIN sessions s ON s.id = p.session_id
      JOIN organizations o ON o.id = s.organization_id
      WHERE p.id = deliverables.project_id
        AND (
          o.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.organization_id = o.id AND up.role IN ('admin', 'manager'))
        )
    )
  );

DROP POLICY IF EXISTS "deliverables_delete" ON deliverables;
CREATE POLICY "deliverables_delete" ON deliverables FOR DELETE
  TO authenticated USING (user_id = auth.uid());
