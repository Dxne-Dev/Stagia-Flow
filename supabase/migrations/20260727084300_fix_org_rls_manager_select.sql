-- Allow organization members (admins, managers) to SELECT the organization row
-- Previously only the owner could read it (org_owner_select), which broke
-- all org-scoped queries for non-owner managers/stagiaires.

DROP POLICY IF EXISTS "org_owner_select" ON organizations;
DROP POLICY IF EXISTS "org_member_select" ON organizations;

CREATE POLICY "org_member_select" ON organizations FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR id = public.get_my_org_id()
  );