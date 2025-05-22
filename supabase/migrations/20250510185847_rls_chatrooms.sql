alter table chatrooms enable row level security;

create policy "Members can access their chatrooms"
on chatrooms for all to authenticated
using (
  is_user_in_chatroom((select auth.uid()), id)
);
