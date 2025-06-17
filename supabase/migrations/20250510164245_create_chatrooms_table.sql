create type chatroom_type as enum (
  'direct',
  'group'
);

 -- Base table for all chatrooms (for table inheritance)
create table if not exists chatrooms (
  id uuid primary key default gen_random_uuid(),
  type chatroom_type not null,
  created_at timestamptz not null default now(),
  pinned_message uuid null
);