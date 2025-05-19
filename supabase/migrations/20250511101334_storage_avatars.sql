-- https://supabase.com/docs/guides/getting-started/tutorials/with-nuxt-3#set-up-the-database-schema
insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
  values ('avatars', 'avatars', true, '{"image/*"}', 300000);

create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload exactly one avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and not exists(
      select 1 from storage.buckets
      where id = 'avatars'
      and owner = (select auth.uid())
    )
  );

create policy "Anyone can update their own avatar" on storage.objects
  for update using ((select auth.uid()) = owner) with check (bucket_id = 'avatars');
