create table if not exists direct_chatrooms (
  -- Default value will never be used, just for correct generation of TS types
  chatroom_id uuid primary key default gen_random_uuid() references chatrooms(id) on delete cascade,
  user1_id uuid default auth.uid() references auth.users(id) on delete set null,
  user2_id uuid references auth.users(id) on delete set null,
  user2_accepted boolean default false,

  check (user1_id <> user2_id), -- No chat with yourself
  unique (user1_id, user2_id) -- Only 1 chatroom for the same 2 users
);
