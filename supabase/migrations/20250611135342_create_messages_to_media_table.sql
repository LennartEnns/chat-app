create type media_type as enum ('image', 'audio', 'text');

create table if not exists messages_to_media (
  message_id uuid primary key not null references public.messages(id) on delete cascade,
  media_id uuid not null  default gen_random_uuid(),
  type media_type not null,
  file_path text
);

alter table messages_to_media enable row level security;

-- create policy "Users can access media of their own messages" on messages_to_media
-- for all using (
--   message_id in (
--     select id from messages where user_id = auth.uid()
--   )
-- );

CREATE POLICY "Users can insert media links for their own messages" ON public.messages_to_media
FOR INSERT WITH CHECK (
  message_id IN (
    SELECT id FROM public.messages WHERE user_id = auth.uid()
  )
);

-- Policy for UPDATE
CREATE POLICY "Users can update media links for their own messages" ON public.messages_to_media
FOR UPDATE USING (
  message_id IN (
    SELECT id FROM public.messages WHERE user_id = auth.uid()
  )
);

-- Policy for DELETE
CREATE POLICY "Users can delete media links for their own messages" ON public.messages_to_media
FOR DELETE USING (
  message_id IN (
    SELECT id FROM public.messages WHERE user_id = auth.uid()
  )
);


-- STEP 4: Create the SELECT policy (allowing all authenticated users to read)
CREATE POLICY "Authenticated users can view all messages media links" ON public.messages_to_media
FOR SELECT USING (
  true -- Allow any authenticated user to read all entries
);

grant insert (message_id, media_id, type, file_path)
on table public.messages_to_media
to authenticated;