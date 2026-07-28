-- Restrict deliverables storage bucket SELECT policy
-- Owner can read their own files, admins/managers can read their org's files
CREATE OR REPLACE FUNCTION public.can_access_deliverable(deliverable_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND (
      up.id::text = (storage.foldername(deliverable_path))[1]
      OR (
        up.role IN ('admin', 'manager')
        AND EXISTS (
          SELECT 1 FROM user_profiles owner
          WHERE owner.id::text = (storage.foldername(deliverable_path))[1]
          AND owner.organization_id = up.organization_id
        )
      )
    )
  )
$$;

DROP POLICY IF EXISTS "deliverables_select" ON storage.objects;
CREATE POLICY "deliverables_select" ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'deliverables'
    AND public.can_access_deliverable(name)
  );
