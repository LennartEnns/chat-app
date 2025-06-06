-- Base Chatrooms RLS
alter table chatrooms enable row level security;

create policy "Members can view their chatrooms"
on chatrooms for select to authenticated
using (
  get_role_in_chatroom((select auth.uid()), id) is not null
);

create policy "Users can create new chatrooms"
on chatrooms for insert to authenticated
with check (true);

-- No direct access, only through views
-- revoke all on public.chatrooms from authenticated, anon;
