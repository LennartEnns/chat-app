-- Base Chatrooms RLS
alter table chatrooms enable row level security;

create policy "Members can view their chatrooms"
on chatrooms for select to authenticated
using (
  utils.get_role_in_chatroom((select auth.uid()), id) is not null
);


-- Users can only view, not manipulate directly
revoke all on public.chatrooms from authenticated, anon;
grant select on public.chatrooms to authenticated;
grant update on public.chatrooms to authenticated;

create policy "Mods and Admins can update their chatrooms"
on chatrooms for update to authenticated
using (
  utils.get_role_in_chatroom((select auth.uid()), id) in ('mod', 'admin')
);