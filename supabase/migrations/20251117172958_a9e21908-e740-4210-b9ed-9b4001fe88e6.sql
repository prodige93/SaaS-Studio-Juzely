-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']::text[]
);

-- RLS policies for project-documents bucket
CREATE POLICY "Authenticated users can view project documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-documents');

CREATE POLICY "Admins can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-documents' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update project documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-documents'
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete project documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-documents'
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);