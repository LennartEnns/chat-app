alter table profiles enable row level security;

create policy "Anyone can read any profiles"
on profiles for select to authenticated
using (true);
