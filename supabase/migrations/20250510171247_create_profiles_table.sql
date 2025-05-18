create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  displayname text null,
  description text not null default '',

  -- Should be identical to the regex in the validation TS script
  constraint username_regex_check check (username ~ $$^[A-Za-z][A-Za-z0-9-]*\Z$$),
  constraint username_length_check check (length(username) <= 30),
  constraint displayname_length_check check (length(displayname) <= 50),
  constraint description_length_check check (length(description) <= 255)
);