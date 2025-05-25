alter table profiles enable row level security;

create policy "Anyone can read any profiles"
on profiles for select to authenticated
using (true);

create policy "Users can update their own profile"
on profiles for update to authenticated
using ((select auth.uid()) = user_id);
