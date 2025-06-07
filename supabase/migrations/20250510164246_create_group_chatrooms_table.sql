create type chatroom_role as enum (
  'admin',
  'mod',
  'member',
  'viewer'
);

create table if not exists group_chatrooms (
  -- Default value will never be used, just for correct generation of TS types
  chatroom_id uuid primary key default gen_random_uuid() references chatrooms(id) on delete cascade,
  name text not null,
  description text null,

  constraint name_length_check check (length(name) <= 30),
  constraint description_length_check check (description is null or length(description) <= 255)
);
