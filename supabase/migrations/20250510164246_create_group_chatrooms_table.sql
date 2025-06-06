create type chatroom_role as enum (
  'admin',
  'mod',
  'member',
  'viewer'
);

create table if not exists group_chatrooms (
  chatroom_id uuid primary key default gen_random_uuid() references chatrooms(id) on delete cascade,
  name text not null,
  description text null
);
