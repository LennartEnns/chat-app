create policy "Avatar images are publicly accessible" on storage.objects
  for select to authenticated using (bucket_id = 'avatars');

create policy "Anyone can upload exactly one avatar" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars'
    and storage.filename(name) = (
      select username from public.profiles where profiles.user_id = auth.uid()
    ) || '.jpg'
    and not exists(
      select 1 from storage.buckets
      where id = 'avatars'
      and owner_id = (select auth.uid()::text)
    )
  );

create policy "Anyone can update their own avatar" on storage.objects
  for update to authenticated
  using (owner_id = (select auth.uid()::text))
  with check (bucket_id = 'avatars');

create policy "Anyone can delete their own avatars" on storage.objects
  for delete to authenticated using
  (owner_id = (select auth.uid()::text) and bucket_id = 'avatars');
