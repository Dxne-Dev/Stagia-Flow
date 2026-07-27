
/*
# Remove all circular RLS dependencies

Complete rewrite of all policies to eliminate circular references.
The key principle: no policy on table A may query table B if table B's policy queries table A.

Strategy:
- user_profiles SELECT: only `id = auth.uid()` (no subqueries)
- organizations SELECT: only `owner_id = auth.uid()` (no subqueries into user_profiles)  
- sessions, projects, deliverables: use organization ownership chain without looping back
- Manager/admin visibility of OTHER users' profiles is deferred — not needed for the core app flow
*/

-- USER PROFILES: only self-read (no recursion possible)
DROP POLICY IF EXISTS "profiles_select" ON user_profiles;
DROP POLICY IF EXISTS "profiles_select_manager" ON user_profiles;

CREATE POLICY "profiles_self_select" ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ORGANIZATIONS: only owner can see own orgs (no user_profiles lookup)
DROP POLICY IF EXISTS "org_select" ON organizations;
CREATE POLICY "org_owner_select" ON organizations FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- SESSIONS: readable if org owner
DROP POLICY IF EXISTS "sessions_select" ON sessions;
CREATE POLICY "sessions_owner_select" ON sessions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

-- Also allow users to read the session they are assigned to
DROP POLICY IF EXISTS "sessions_member_select" ON sessions;
CREATE POLICY "sessions_member_select" ON sessions FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT session_id FROM user_profiles
      WHERE id = auth.uid() AND session_id IS NOT NULL
    )
  );

-- PROJECTS: org owner can see all projects in their sessions
DROP POLICY IF EXISTS "projects_select" ON projects;
CREATE POLICY "projects_owner_select" ON projects FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      WHERE s.organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
      )
    )
  );

-- Stagiaires can see active projects in their session
DROP POLICY IF EXISTS "projects_member_select" ON projects;
CREATE POLICY "projects_member_select" ON projects FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT session_id FROM user_profiles
      WHERE id = auth.uid() AND session_id IS NOT NULL
    )
  );

-- DELIVERABLES: own deliverables + org owner can see all
DROP POLICY IF EXISTS "deliverables_select" ON deliverables;
CREATE POLICY "deliverables_own_select" ON deliverables FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "deliverables_manager_select" ON deliverables;
CREATE POLICY "deliverables_manager_select" ON deliverables FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN sessions s ON s.id = p.session_id
      WHERE s.organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
      )
    )
  );

-- Fix insert/update/delete policies for sessions/projects to not use user_profiles lookup
DROP POLICY IF EXISTS "sessions_insert" ON sessions;
CREATE POLICY "sessions_org_insert" ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "sessions_update" ON sessions;
CREATE POLICY "sessions_org_update" ON sessions FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "sessions_delete" ON sessions;
CREATE POLICY "sessions_org_delete" ON sessions FOR DELETE
  TO authenticated
  USING (
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_org_insert" ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT s.id FROM sessions s
      WHERE s.organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_org_update" ON projects FOR UPDATE
  TO authenticated
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      WHERE s.organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT s.id FROM sessions s
      WHERE s.organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    )
  );
