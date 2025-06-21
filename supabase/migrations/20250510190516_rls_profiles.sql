alter table profiles enable row level security;

create policy "Anyone can read any profiles"
on profiles for select to authenticated, anon
using (true);

revoke select on profiles from anon;
-- You can only select usernames if not logged in
grant select (username) on profiles to anon;
