-- Create storage bucket for deliverable file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deliverables',
  'deliverables',
  true,
  10485760,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'text/plain', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload files to the deliverables bucket
DROP POLICY IF EXISTS "deliverables_upload" ON storage.objects;
CREATE POLICY "deliverables_upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'deliverables'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS: anyone can read files from the deliverables bucket (public for managers to view)
DROP POLICY IF EXISTS "deliverables_select" ON storage.objects;
CREATE POLICY "deliverables_select" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'deliverables');

-- RLS: users can delete their own files
DROP POLICY IF EXISTS "deliverables_delete" ON storage.objects;
CREATE POLICY "deliverables_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'deliverables'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );