create policy "Only chatroom members can see the avatar" on storage.objects
for select to authenticated using (
  bucket_id = 'chatroom_avatars'
  and get_role_in_chatroom((select auth.uid()), get_filename_as_uuid(storage.filename(name))) is not null
);

create policy "Admins can upload exactly one avatar for their chatroom" on storage.objects
for insert to authenticated with check (
  bucket_id = 'chatroom_avatars'
  and array_length(storage.foldername(name), 1) = 0
  and get_role_in_chatroom((select auth.uid()), get_filename_as_uuid(storage.filename(name))) = 'admin'
);

create policy "Admins can update the avatar of their chatroom" on storage.objects
for update to authenticated
using (
  bucket_id = 'chatroom_avatars'
  and get_role_in_chatroom((select auth.uid()), get_filename_as_uuid(storage.filename(name))) = 'admin'
);

create policy "Admins can delete the avatar of their chatroom" on storage.objects
for delete to authenticated using (
  bucket_id = 'chatroom_avatars'
  and get_role_in_chatroom((select auth.uid()), get_filename_as_uuid(storage.filename(name))) = 'admin'
);
