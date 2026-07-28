CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.user_profiles WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "profiles_org_select" ON user_profiles;
CREATE POLICY "profiles_org_select" ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR organization_id = public.get_my_org_id()
  );

DROP POLICY IF EXISTS "profiles_org_update" ON user_profiles;
CREATE POLICY "profiles_org_update" ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.get_my_org_id()
  )
  WITH CHECK (
    organization_id = public.get_my_org_id()
  );