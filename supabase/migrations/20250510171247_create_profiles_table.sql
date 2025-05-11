create table if not exists profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  displayname text null,
  avatar_url text,
);