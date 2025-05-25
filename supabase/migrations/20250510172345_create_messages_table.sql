create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  chatroom_id uuid not null,
  content text not null,
  created_at timestamptz not null default now(),

  -- Composite foreign key
  foreign key (user_id, chatroom_id) references user_to_chatroom(user_id, chatroom_id)
);