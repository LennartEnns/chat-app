alter table user_to_chatroom enable row level security;

create policy "Members can see other members' memberships"
on user_to_chatroom for select to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) is not null
);

create policy "Users can add themselves as members based on an invitation"
on user_to_chatroom for insert to authenticated
with check (
  user_to_chatroom.role is not null
  and get_role_in_invitation((select auth.uid()), user_to_chatroom.chatroom_id) = user_to_chatroom.role
);

create policy "Mods can convert member to viewer and vice versa"
on user_to_chatroom for update to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) = 'mod'
  and (role = 'viewer' or role = 'member')
) with check (
  (role = 'viewer' or role = 'member')
);

create policy "Admins can change the role of non-admins"
on user_to_chatroom for update to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) = 'admin'
  and role != 'admin'
);

create policy "Admins can remove non-admins from the chatroom"
on user_to_chatroom for delete to authenticated
using (
  get_role_in_chatroom((select auth.uid()), chatroom_id) = 'admin'
  and role != 'admin'
);

create policy "Users can leave the chatroom"
on user_to_chatroom for delete to authenticated
using (
  user_id = (select auth.uid())
);