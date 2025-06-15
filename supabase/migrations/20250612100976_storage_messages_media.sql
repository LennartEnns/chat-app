insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
  values ('messages_media', 'messages_media', false, '{"image/*", "audio/*"}', 500);