insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
  values ('messages_media', 'messages_media', false, '{"image/*", "audio/*"}', 500000);

create policy "Users can upload their own media" ON storage.objects
for insert with check (
  bucket_id = 'messages_media' and
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

create policy "Allow authenticated user to view files"
on storage.objects for select
to authenticated
using (bucket_id = 'messages_media');

-- Policy für Download (SELECT)
create policy "Users can view their own media" on storage.objects
for select using (
  bucket_id = 'messages_media' and
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy für Delete
create policy "Users can delete their own media" on storage.objects
for delete using (
  bucket_id = 'messages_media' and
  (string_to_array(name, '/'))[1] = auth.uid()::text
);