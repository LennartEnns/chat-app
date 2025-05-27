-- https://supabase.com/docs/guides/getting-started/tutorials/with-nuxt-3#set-up-the-database-schema
insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
  values ('avatars', 'avatars', true, '{"image/*"}', 200000);
