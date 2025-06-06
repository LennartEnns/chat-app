alter table user_to_group enable row level security;

-- TODO:
-- Admins cannot leave if they are the only admin

create policy "Members can see other members' memberships"
on user_to_group for select to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) is not null
);

create policy "Users can add themselves as members based on an invitation"
on user_to_group for insert to authenticated
with check (
  user_to_group.user_id = (select auth.uid())
  and user_to_group.role is not null
  and get_role_in_invitation(user_to_group.user_id, user_to_group.chatroom_id) = user_to_group.role
);

create policy "Mods can convert member to viewer and vice versa"
on user_to_group for update to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) = 'mod'
  and (role = 'viewer' or role = 'member')
) with check (
  (role = 'viewer' or role = 'member')
);

create policy "Admins can change the role of non-admins"
on user_to_group for update to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) = 'admin'
  and role != 'admin'
);

create policy "Admins can remove non-admins from the chatroom"
on user_to_group for delete to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) = 'admin'
  and role != 'admin'
);

create policy "Users can leave chatroom, except if they are the last admin"
on user_to_group for delete to authenticated
using (
  user_id = (select auth.uid())
  and (role != 'admin' or
      (select count(1) from public.user_to_group utc
       where utc.chatroom_id = chatroom_id
       and   utc.role = 'admin') > 1)
);

-- Only the role column can be updated
revoke update
on table public.user_to_group
from authenticated;

grant update (role)
on table public.user_to_group
to authenticated;