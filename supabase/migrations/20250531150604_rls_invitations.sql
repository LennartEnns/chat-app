alter table invitations enable row level security;

create policy "Mods/Admins can see invitations to their chatroom"
on invitations for select to authenticated
using (
  get_role_in_chatroom((select auth.uid()), invitations.chatroom_id) in ('mod', 'admin')
);

create policy "Invitees can see their invitations"
on invitations for select to authenticated
using (
  invitations.invitee_id = (select auth.uid())
);

create policy "Mods can invite users as member/viewer"
on invitations for insert to authenticated
with check (
  get_role_in_chatroom((select auth.uid()), invitations.chatroom_id) = 'mod'
  and invitations.role in ('member', 'viewer')
  and invitations.invitor_id is null
);

create policy "Admins can invite users as any role"
on invitations for insert to authenticated
with check (
  get_role_in_chatroom((select auth.uid()), invitations.chatroom_id) = 'admin'
  and invitations.invitor_id is null
);

-- Updating invitations is not allowed, so no permissive update policies

create policy "Admins/Mods can delete invitations where they are the invitor"
on invitations for delete to authenticated
using (
  get_role_in_chatroom((select auth.uid()), invitations.chatroom_id) in ('admin', 'mod')
  and invitations.invitor_id = (select auth.uid())
);

create policy "Admins can delete invitations where the invitor is a non-admin"
on invitations for delete to authenticated
using (
  get_role_in_chatroom((select auth.uid()), invitations.chatroom_id) = 'admin'
  and get_role_in_chatroom(invitations.invitor_id, invitations.chatroom_id) != 'admin'
);

create policy "Invitees can delete their invitations manually to reject them"
on invitations for delete to authenticated
using (
  invitations.invitee_id = (select auth.uid())
);