alter table chatrooms enable row level security;

create policy "Members can view their chatrooms"
on chatrooms for select to authenticated
using (
  get_role_in_chatroom((select auth.uid()), id) is not null
);

create policy "Users can create chatrooms"
on chatrooms for insert to authenticated
with check (true);

create policy "Admins can change chatroom properties"
on chatrooms for update to authenticated
using (
  get_role_in_chatroom((select auth.uid()), id) = 'admin'
);

create policy "Admins can delete the chatroom"
on chatrooms for delete to authenticated
using (
  get_role_in_chatroom((select auth.uid()), id) = 'admin'
);