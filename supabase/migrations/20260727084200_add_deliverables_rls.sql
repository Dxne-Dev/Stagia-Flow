DROP POLICY IF EXISTS "deliverables_manager_select" ON deliverables;
CREATE POLICY "deliverables_manager_select" ON deliverables FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR project_id IN (
      SELECT p.id FROM projects p
      JOIN sessions s ON s.id = p.session_id
      WHERE s.organization_id = public.get_my_org_id()
    )
  );

DROP POLICY IF EXISTS "deliverables_manager_update" ON deliverables;
CREATE POLICY "deliverables_manager_update" ON deliverables FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN sessions s ON s.id = p.session_id
      WHERE s.organization_id = public.get_my_org_id()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN sessions s ON s.id = p.session_id
      WHERE s.organization_id = public.get_my_org_id()
    )
  );