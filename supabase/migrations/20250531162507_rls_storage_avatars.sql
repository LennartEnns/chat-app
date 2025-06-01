create policy "User avatars are public" on storage.objects
for select to authenticated using (
  bucket_id = 'avatars'
);

create policy "Anyone can upload exactly one avatar" on storage.objects
for insert to authenticated with check (
  bucket_id = 'avatars'
  and name = ('public/' || (select auth.uid())::text || '.jpg')
);

create policy "Anyone can update their own avatar" on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars'
  and owner_id::uuid = (select auth.uid())
);

create policy "Anyone can delete their own avatars" on storage.objects
for delete to authenticated
using (
  bucket_id = 'avatars'
  and owner_id::uuid = (select auth.uid())
);
