create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chatroom_id uuid not null references public.chatrooms(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);