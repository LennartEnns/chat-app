create type media_type as enum ('image', 'audio', 'text');

create table if not exists messages_to_media (
  message_id uuid primary key not null references public.messages(id) on delete cascade,
  media_id uuid not null  default gen_random_uuid(),
  type media_type not null
);

alter table messages_to_media enable row level security;

create policy "Users can access media of their own messages" on messages_to_media
for all using (
  message_id in (
    select id from messages where user_id = auth.uid()
  )
);

grant insert (message_id, media_id, type)
on table public.messages_to_media
to authenticated;