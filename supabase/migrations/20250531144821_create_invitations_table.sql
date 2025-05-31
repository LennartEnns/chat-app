create table if not exists invitations (
  invitee_id uuid not null references auth.users(id) on delete cascade,
  chatroom_id uuid not null references public.chatrooms(id) on delete cascade,
  invitor_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role chatroom_role not null,
  created_at timestamptz not null default now(),

  primary key (invitee_id, chatroom_id)
);