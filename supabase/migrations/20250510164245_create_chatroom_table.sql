create table if not exists chatrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default ''
);